// RLS가 실제로 막는지 확인한다 (docs/LAUNCH.md의 수동 점검을 자동화).
//
//   node scripts/rls-check.mjs
//
// 한 트랜잭션 안에서 가상 사용자 A·B를 만들고, Supabase API와 같은 조건
// (role authenticated/anon + JWT sub)으로 남의 데이터를 건드려 본다. 끝나면 전부 롤백하므로
// 실제 계정·데이터는 남지 않는다. .env.local의 SUPABASE_DB_URL이 필요하다.

import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID } from 'node:crypto'
import postgres from 'postgres'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const envPath = join(root, '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
if (!process.env.SUPABASE_DB_URL) {
  console.error('SUPABASE_DB_URL이 없습니다 (.env.local).')
  process.exit(1)
}

const sql = postgres(process.env.SUPABASE_DB_URL, { max: 1, prepare: false, onnotice: () => {} })
const A = randomUUID()
const B = randomUUID()
const ROLLBACK = Symbol('rollback')
const results = []

// uid가 null이면 anon. 결과와 상관없이 savepoint를 되돌려 검사끼리 섞이지 않게 한다.
async function as(tx, uid, run) {
  let out
  try {
    await tx.savepoint(async (sp) => {
      await sp.unsafe(`set local role ${uid ? 'authenticated' : 'anon'}`)
      await sp`select set_config('request.jwt.claims', ${JSON.stringify(uid ? { sub: uid, role: 'authenticated' } : { role: 'anon' })}, true)`
      await sp`select set_config('request.jwt.claim.sub', ${uid ?? ''}, true)`
      out = { ok: true, value: await run(sp) }
      throw ROLLBACK
    })
  } catch (e) {
    if (e !== ROLLBACK) out = { ok: false, error: e.message }
  }
  return out
}

function check(name, pass, detail = '') {
  results.push({ name, pass })
  console.log(`${pass ? '✔' : '✘'} ${name}${!pass && detail ? `  — ${detail}` : ''}`)
}

const rejected = (r) => !r.ok
const zeroRows = (r) => r.ok && r.value.count === 0

try {
  await sql.begin(async (tx) => {
    // ── 준비 (관리자 권한) ──────────────────────────────────────────
    for (const [id, nick] of [[A, 'rls-a'], [B, 'rls-b']]) {
      await tx`insert into auth.users (id, aud, role, email) values (${id}, 'authenticated', 'authenticated', ${`${nick}-${id}@rls.test`})`
      await tx`insert into public.profiles (id, nickname) values (${id}, ${nick}) on conflict (id) do nothing`
    }
    const [post] = await tx`insert into public.posts (author_id, content) values (${A}, 'RLS 점검용 글') returning id`
    await tx`insert into public.blind_reactions (user_id, blind_book_id, action) values (${A}, 1, 'save')`
    await tx`insert into public.wishlist (user_id, book_id, title) values (${A}, 'isbn-rls', 'RLS 점검용 책')`
    await tx`insert into public.books (id, title) values ('isbn-rls', '원래 제목') on conflict (id) do nothing`

    // ── 0. 모든 public 테이블에 RLS가 켜져 있다 ─────────────────────
    const noRls = await tx`
      select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity`
    check('public 테이블 전부 RLS 켜짐', noRls.length === 0, noRls.map((r) => r.relname).join(', '))

    // ── 1. 남의 글 ──────────────────────────────────────────────────
    check('B는 A의 글을 수정할 수 없다',
      zeroRows(await as(tx, B, (s) => s`update public.posts set content = '탈취' where id = ${post.id}`)))
    check('B는 A의 글을 삭제할 수 없다',
      zeroRows(await as(tx, B, (s) => s`delete from public.posts where id = ${post.id}`)))
    check('B는 A 이름으로 글을 쓸 수 없다',
      rejected(await as(tx, B, (s) => s`insert into public.posts (author_id, content) values (${A}, '사칭 글')`)))
    check('비로그인은 글을 쓸 수 없다',
      rejected(await as(tx, null, (s) => s`insert into public.posts (author_id, content) values (${A}, '익명 글')`)))

    // ── 2. 집계 컬럼 (0023) ─────────────────────────────────────────
    const inflated = await as(tx, A, async (s) => {
      await s`update public.posts set like_count = 9999, comment_count = 9999 where id = ${post.id}`
      return (await s`select like_count, comment_count from public.posts where id = ${post.id}`)[0]
    })
    check('작성자도 좋아요·댓글 수를 직접 고칠 수 없다',
      inflated.ok && inflated.value.like_count === 0 && inflated.value.comment_count === 0, JSON.stringify(inflated))

    const liked = await as(tx, B, async (s) => {
      await s`insert into public.likes (user_id, target_id, target_type) values (${B}, ${post.id}, 'post')`
      return (await s`select like_count from public.posts where id = ${post.id}`)[0]
    })
    check('좋아요를 누르면 트리거로 카운트가 오른다', liked.ok && liked.value.like_count === 1, JSON.stringify(liked))

    // ── 3. 본인만 보는 데이터 ───────────────────────────────────────
    for (const table of ['blind_reactions', 'wishlist', 'token_ledger', 'notifications']) {
      const r = await as(tx, B, (s) => s`select 1 from ${s(`public.${table}`)} where user_id = ${A}`)
      check(`B는 A의 ${table}를 볼 수 없다`, r.ok && r.value.length === 0, JSON.stringify(r))
    }

    // ── 4. DB 함수만 쓰는 테이블 ────────────────────────────────────
    check('토큰을 직접 지급할 수 없다',
      rejected(await as(tx, B, (s) => s`insert into public.token_ledger (user_id, amount, reason) values (${B}, 100, 'welcome')`)))
    check('알림을 직접 만들 수 없다',
      rejected(await as(tx, A, (s) => s`insert into public.notifications (user_id, actor_id, type) values (${B}, ${A}, 'follow')`)))
    check('notify() RPC로 남에게 가짜 알림을 만들 수 없다',
      rejected(await as(tx, A, (s) => s`select public.notify(${B}, ${A}, 'follow', null, null)`)))
    const followNoti = await as(tx, A, async (s) => {
      await s`insert into public.follows (follower_id, followee_id) values (${A}, ${B})`
      await s`select set_config('request.jwt.claims', ${JSON.stringify({ sub: B, role: 'authenticated' })}, true)`
      await s`select set_config('request.jwt.claim.sub', ${B}, true)`
      return (await s`select count(*)::int as count from public.notifications where actor_id = ${A}`)[0]
    })
    check('팔로우하면 트리거로 알림은 생긴다', followNoti.ok && followNoti.value.count === 1, JSON.stringify(followNoti))

    // ── 5. 공용 책 정보 (0023) ──────────────────────────────────────
    const book = await as(tx, B, async (s) => {
      await s`update public.books set title = '훼손' where id = 'isbn-rls'`
      return (await s`select title from public.books where id = 'isbn-rls'`)[0]
    })
    check('남이 등록한 책 정보를 덮어쓸 수 없다', book.ok && book.value.title === '원래 제목', JSON.stringify(book))

    throw ROLLBACK
  })
} catch (e) {
  if (e !== ROLLBACK) {
    console.error('\n준비 단계에서 실패:', e.message)
    process.exitCode = 1
  }
} finally {
  await sql.end()
}

const failed = results.filter((r) => !r.pass).length
console.log(`\n${results.length - failed}/${results.length} 통과 (모든 변경은 롤백됨)`)
if (failed) process.exitCode = 1
