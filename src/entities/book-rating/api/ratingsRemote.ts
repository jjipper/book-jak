// 평가·리뷰 (Supabase ratings/books) — 원본 데이터는 여기에 있다.
// 화면이 동기로 읽는 localStorage 사본은 syncMyRatings()가 서버 기준으로 맞춘다.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getNickname } from '@/entities/user/model/profile'
import { replaceBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'

export interface RemoteBookInput {
  id: string // 'b01' 또는 'isbn-{ISBN13}'
  title: string
  authors?: string[]
  publisher?: string
  year?: number | null
  thumbnail?: string
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
      review: review?.trim() || null,
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

// 서버의 내 평가를 로컬 사본에 반영 — 평가 화면 진입 시 한 번 호출한다.
// 기기를 바꾸거나 저장소를 비워도 내 평가가 그대로 보이게 하는 게 목적.
export async function syncMyRatings(): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  const { data } = await sb
    .from('ratings')
    .select('book_id, stars, review, updated_at, books(title)')
    .eq('user_id', user.id)
  if (!data) return
  const records: BookRatingRecord[] = data.map((r: Record<string, unknown>) => ({
    bookId: r.book_id as string,
    title: (r.books as { title: string } | null)?.title,
    stars: r.stars as number,
    review: (r.review as string | null) ?? undefined,
    ts: new Date(r.updated_at as string).getTime(),
  }))
  replaceBookRatings(records)
}
