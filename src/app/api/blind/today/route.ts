// 오늘의 블라인드 북 — 알라딘 실제 책에서 날짜(KST)별로 모든 사용자에게 같은 5권.
// GET  : 가려진 카드 목록 + 내 진행도(넘어감/공개). 공개한 책만 제목 등 정보가 내려간다.
// POST : { date, index, action: 'pass' | 'save' | 'reveal' }
//        reveal은 DB의 reveal_blind()가 잔액 확인·차감을 원자적으로 한다.

import { unstable_cache } from 'next/cache'
import { createSupabaseServer } from '@/shared/api/supabase-server'
import {
  kstDateKey,
  pickDailyBlindBooks,
  type AladdinItem,
  type BlindBook,
  type DailyBlindBook,
} from '@/entities/blind-book/model/blindBooks'

// 소설 / 에세이 / 인문 베스트셀러를 섞는다
const CATEGORIES = ['1', '55889', '656']

// 날짜로 과거 한 주(약 5년 안)를 고른다. 지난주 베스트셀러는 바뀌지 않아서
// 캐시가 어느 시점에 갱신되든 같은 날짜는 같은 목록이 나온다.
function weekOf(dateKey: string) {
  const [y, m, d] = dateKey.split('-').map(Number)
  let seed = 0
  for (const c of dateKey) seed = (seed * 31 + c.charCodeAt(0)) | 0
  const weeksAgo = 2 + (Math.abs(seed) % 260)
  const t = new Date(Date.UTC(y, m - 1, d) - weeksAgo * 7 * 86400_000)
  return { Year: String(t.getUTCFullYear()), Month: String(t.getUTCMonth() + 1), Week: String(Math.min(4, Math.ceil(t.getUTCDate() / 7))) }
}

// 실패는 throw — 한 카테고리만 빠진 채로 캐시되면 그날 목록이 달라진다
async function fetchCategory(key: string, categoryId: string, dateKey: string): Promise<AladdinItem[]> {
  const params = new URLSearchParams({
    TTBKey: key,
    QueryType: 'Bestseller',
    CategoryId: categoryId,
    MaxResults: '50',
    Start: '1',
    SearchTarget: 'Book',
    Cover: 'Big',
    Output: 'JS',
    Version: '20131101',
    ...weekOf(dateKey),
  })
  const res = await fetch(`https://www.aladin.co.kr/ttb/api/ItemList.aspx?${params}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`aladdin ${res.status}`)
  const data = JSON.parse(await res.text()) as { item?: AladdinItem[] }
  if (!data.item?.length) throw new Error('aladdin empty')
  return data.item
}

// 날짜별 하루 캐시 (날짜가 인자라 캐시 키에 들어간다). throw한 결과는 캐시되지 않는다.
const getDailyCached = unstable_cache(
  async (dateKey: string): Promise<DailyBlindBook[]> => {
    const key = process.env.ALADDIN_TTB_KEY
    if (!key) throw new Error('ALADDIN_TTB_KEY 없음')
    const lists = await Promise.all(CATEGORIES.map((c) => fetchCategory(key, c, dateKey)))
    return pickDailyBlindBooks(lists.flat(), dateKey)
  },
  ['blind-daily-v1'], // 선정·가림 규칙을 바꾸면 버전을 올린다 (안 올리면 그날 캐시가 옛 규칙대로 남는다)
  { revalidate: 86400 },
)

const getDaily = (dateKey: string) => getDailyCached(dateKey).catch((): DailyBlindBook[] => [])

const noStore = { headers: { 'Cache-Control': 'private, no-store' } }

export async function GET() {
  const date = kstDateKey()
  const daily = await getDaily(date)
  if (daily.length === 0) return Response.json({ error: '오늘의 블라인드 북을 불러오지 못했어요' }, { status: 502 })

  const sb = await createSupabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  const isbns = daily.map((d) => d.book.isbn13)
  const reacted = new Set<string>() // 넘어감 또는 서재 담기
  const revealed = new Set<string>()
  if (user) {
    const [{ data: r }, { data: l }] = await Promise.all([
      sb.from('blind_reactions').select('blind_book_id').eq('user_id', user.id).in('blind_book_id', isbns),
      sb.from('token_ledger').select('ref_id').eq('user_id', user.id).eq('reason', 'reveal').in('ref_id', isbns),
    ])
    for (const row of r ?? []) reacted.add(String(row.blind_book_id))
    for (const row of l ?? []) revealed.add(row.ref_id)
  }

  const books: BlindBook[] = daily.map((d, index) => {
    const isbn = d.book.isbn13
    const status = revealed.has(isbn) ? 'revealed' : reacted.has(isbn) ? 'passed' : 'new'
    return { index, blurb: d.blurb, tags: d.tags, illustCode: d.illustCode, status, ...(status === 'revealed' ? { book: d.book } : {}) }
  })
  return Response.json({ date, books }, noStore)
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { date?: string; index?: number; action?: string } | null
  const date = kstDateKey()
  // 자정을 넘긴 화면에서 온 요청 — 인덱스가 다른 책을 가리키므로 새로고침시킨다
  if (!body || body.date !== date) return Response.json({ error: 'STALE' }, { status: 409 })

  const sb = await createSupabaseServer()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return Response.json({ error: 'LOGIN_REQUIRED' }, { status: 401 })

  const target = (await getDaily(date))[body.index ?? -1]
  if (!target) return Response.json({ error: 'NOT_FOUND' }, { status: 404 })
  const isbn = target.book.isbn13

  if (body.action === 'pass' || body.action === 'save') {
    const { error } = await sb.from('blind_reactions').upsert(
      { user_id: user.id, blind_book_id: Number(isbn), action: body.action },
      { onConflict: 'user_id,blind_book_id' },
    )
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true }, noStore)
  }

  if (body.action === 'reveal') {
    const { data, error } = await sb.rpc('reveal_blind', { p_isbn: isbn })
    if (error) {
      const noToken = error.message.includes('NO_TOKEN')
      return Response.json({ error: noToken ? 'NO_TOKEN' : error.message }, { status: noToken ? 402 : 500 })
    }
    return Response.json({ balance: data as number, book: target.book }, noStore)
  }

  return Response.json({ error: 'BAD_ACTION' }, { status: 400 })
}
