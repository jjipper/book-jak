// supabase/migrations/*.sql을 번호순으로 실행한다.
//
//   node scripts/migrate.mjs           적용 안 된 것만 실행
//   node scripts/migrate.mjs --status  뭐가 적용됐는지만 보기
//   node scripts/migrate.mjs --force 0014_tokens.sql   특정 파일 다시 실행
//
// .env.local의 SUPABASE_DB_URL(Supabase > Settings > Database > Connection string > URI)이 필요하다.
// 실행한 파일은 public._migrations에 기록해서 두 번 돌지 않는다.

import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import postgres from 'postgres'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dir = join(root, 'supabase', 'migrations')

function loadEnv() {
  const p = join(root, '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const url = process.env.SUPABASE_DB_URL
if (!url) {
  console.error(
    '\nSUPABASE_DB_URL이 없습니다.\n' +
    'Supabase 대시보드 > Settings > Database > Connection string > URI 를 복사해서\n' +
    '.env.local에 아래 한 줄을 추가하세요 (이 파일은 git에 올라가지 않습니다):\n\n' +
    '  SUPABASE_DB_URL=postgresql://postgres.xxxx:비밀번호@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres\n',
  )
  process.exit(1)
}

const args = process.argv.slice(2)
const statusOnly = args.includes('--status')
const forceIdx = args.indexOf('--force')
const forceFile = forceIdx >= 0 ? args[forceIdx + 1] : null

// 마이그레이션은 DDL이 많아 트랜잭션 파이프라이닝을 끄고 한 문장씩 보낸다
const sql = postgres(url, { max: 1, prepare: false, onnotice: () => {} })

try {
  await sql`create table if not exists public._migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )`

  const applied = new Set(
    (await sql`select name from public._migrations`).map((r) => r.name),
  )
  const files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()

  if (statusOnly) {
    for (const f of files) console.log(`${applied.has(f) ? '✔ 적용됨' : '· 대기 '}  ${f}`)
    process.exit(0)
  }

  const todo = forceFile ? files.filter((f) => f === forceFile) : files.filter((f) => !applied.has(f))
  if (forceFile && todo.length === 0) {
    console.error(`${forceFile} 파일을 찾지 못했습니다.`)
    process.exit(1)
  }
  if (todo.length === 0) {
    console.log('적용할 마이그레이션이 없습니다.')
    process.exit(0)
  }

  for (const f of todo) {
    process.stdout.write(`→ ${f} ... `)
    try {
      await sql.unsafe(readFileSync(join(dir, f), 'utf8'))
      await sql`insert into public._migrations (name) values (${f})
                on conflict (name) do update set applied_at = now()`
      console.log('완료')
    } catch (e) {
      console.log('실패')
      console.error(`\n${f} 에서 멈췄습니다. 이 파일은 기록되지 않았습니다.\n`)
      console.error(e.message)
      if (e.position) console.error(`위치: ${e.position}`)
      if (e.hint) console.error(`힌트: ${e.hint}`)
      process.exit(1)
    }
  }
  console.log(`\n${todo.length}개 적용 완료.`)
} finally {
  await sql.end({ timeout: 5 })
}
