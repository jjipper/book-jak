// 평가·리뷰 (Supabase ratings/books) — 원본 데이터는 여기에 있다.
// 화면이 동기로 읽는 localStorage 사본은 syncMyRatings()가 서버와 병합한다.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getNickname } from '@/entities/user/model/profile'
import { loadBookRatings, replaceBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'

export interface RemoteBookInput {
  id: string // 'b01' 또는 'isbn-{ISBN13}'
  title: string
  authors?: string[]
  publisher?: string
  year?: number | null
  thumbnail?: string
  categoryName?: string // 알라딘 장르 — 기기가 바뀌어도 장르 분석이 유지되도록 ratings에 함께 저장
}

interface RemoteReview {
  userId: string
  nickname: string
  stars: number
  review: string | null
  createdAt: string
}

export interface RemoteBookStats {
  count: number
  avg: number
  distribution: [number, number, number, number, number] // 1~5점 비율(%)
  reviews: RemoteReview[] // review가 있는 것만, 최신순
  myUserId: string | null
}

// 내 평가를 서버에 업서트 (책 메타데이터도 함께 스냅샷) — 로그인 필수
export async function pushRating(book: RemoteBookInput, stars: number, review?: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  const userId = user.id

  const { error: bookError } = await sb.from('books').upsert({
    id: book.id,
    title: book.title,
    authors: book.authors ?? [],
    publisher: book.publisher ?? null,
    year: book.year ?? null,
    thumbnail: book.thumbnail ?? null,
  })
  if (bookError) throw new Error(bookError.message)

  const { error } = await sb.from('ratings').upsert(
    {
      user_id: userId,
      book_id: book.id,
      nickname: getNickname(),
      stars,
      // 리뷰 입력이 없는 호출부(목록 별점)는 키를 빼서 기존 리뷰를 지우지 않는다
      ...(review !== undefined ? { review: review.trim() || null } : {}),
      // 카테고리를 모르는 호출부는 키를 빼서 서버의 기존 값을 덮지 않는다
      ...(book.categoryName ? { category_name: book.categoryName } : {}),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,book_id' },
  )
  if (error) throw new Error(error.message)
}

// 책 하나의 커뮤니티 통계 + 리뷰 목록
export async function fetchBookStats(bookId: string): Promise<RemoteBookStats | null> {
  const sb = createSupabaseBrowser()

  const { data, error } = await sb
    .from('ratings')
    .select('user_id, nickname, stars, review, created_at')
    .eq('book_id', bookId)
    .order('created_at', { ascending: false })
  if (error || !data) return null

  const { data: { session } } = await sb.auth.getSession()
  const myUserId = session?.user.id ?? null

  const count = data.length
  const dist: [number, number, number, number, number] = [0, 0, 0, 0, 0]
  let sum = 0
  for (const r of data) {
    sum += r.stars
    const bucket = Math.round(r.stars) // 0.5 단위 별점은 반올림해서 분포에 집계
    if (bucket >= 1 && bucket <= 5) dist[bucket - 1]++
  }
  const distribution = dist.map((n) => (count ? Math.round((n / count) * 100) : 0)) as RemoteBookStats['distribution']

  return {
    count,
    avg: count ? Math.round((sum / count) * 10) / 10 : 0,
    distribution,
    reviews: data
      .filter((r) => r.review && r.review.trim().length > 0)
      .map((r) => ({
        userId: r.user_id,
        nickname: r.nickname || '익명 독서가',
        stars: r.stars,
        review: r.review,
        createdAt: r.created_at,
      })),
    myUserId,
  }
}

// 별점 취소 — 서버의 내 평가도 지운다 (안 지우면 다음 sync 때 되살아난다)
export async function deleteRating(bookId: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  const { error } = await sb.from('ratings').delete().eq('user_id', user.id).eq('book_id', bookId)
  if (error) throw new Error(error.message)
}

// 서버의 내 평가와 로컬 사본을 병합 — 평가 화면 진입 시 한 번 호출한다.
// 같은 책은 더 최근 것이 이기고, 서버에 없거나 로컬이 더 새로운 항목은 서버로 올린다.
// (로그인 전·오프라인·push 실패로 로컬에만 남은 별점이 사라지지 않게)
export async function syncMyRatings(): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  const { data, error } = await sb
    .from('ratings')
    .select('book_id, stars, review, category_name, updated_at, books(title)')
    .eq('user_id', user.id)
  if (error || !data) return

  // 예전 버그로 남은 0점 기록은 버린다 (서버 check 제약에 걸려 push 묶음 전체가 실패한다)
  const local = new Map(loadBookRatings().filter((r) => r.stars > 0).map((r) => [r.bookId, r]))
  const merged = new Map<string, BookRatingRecord>()
  for (const r of data as Record<string, unknown>[]) {
    const bookId = r.book_id as string
    const mine = local.get(bookId)
    merged.set(bookId, {
      bookId,
      title: (r.books as { title: string } | null)?.title ?? mine?.title,
      categoryName: (r.category_name as string | null) ?? mine?.categoryName,
      stars: r.stars as number,
      review: (r.review as string | null) ?? undefined,
      ts: new Date(r.updated_at as string).getTime(),
    })
  }

  const toPush: BookRatingRecord[] = []
  for (const mine of local.values()) {
    const server = merged.get(mine.bookId)
    if (server && server.ts >= mine.ts) continue
    const record = { ...mine, categoryName: mine.categoryName ?? server?.categoryName }
    merged.set(mine.bookId, record)
    toPush.push(record)
  }

  // 로컬은 병합본을 먼저 저장 — push가 실패해도 별점은 남고 다음 sync 때 다시 올라간다
  replaceBookRatings([...merged.values()])
  if (toPush.length === 0) return

  // 책 메타는 제목만 알 수 있으니, 이미 있는 책 행은 건드리지 않는다
  await sb.from('books').upsert(
    toPush.map((r) => ({ id: r.bookId, title: r.title ?? '제목 없음' })),
    { onConflict: 'id', ignoreDuplicates: true },
  )
  await sb.from('ratings').upsert(
    toPush.map((r) => ({
      user_id: user.id,
      book_id: r.bookId,
      nickname: getNickname(),
      stars: r.stars,
      review: r.review?.trim() || null,
      category_name: r.categoryName ?? null,
      updated_at: new Date(r.ts).toISOString(),
    })),
    { onConflict: 'user_id,book_id' },
  )
}

export interface BookDetailExtraStats {
  wishCount: number
  typeAvg: number | null // 같은 BOOKBTI 유형 평균 — 3명 이상일 때만
  typeCount: number
  alsoLiked: { id: string; title: string; thumbnail: string | null; likes: number }[]
}

// 서재에 담은 사람 수·같은 유형 평균·"이 책을 좋아한 사람들이 좋아한 책" (0012 book_detail_stats RPC)
export async function fetchBookDetailStats(bookId: string, typeCode: string | null): Promise<BookDetailExtraStats | null> {
  const { data, error } = await createSupabaseBrowser().rpc('book_detail_stats', { p_book_id: bookId, p_type_code: typeCode })
  if (error || !data) return null
  return data as BookDetailExtraStats
}
