// 평가·리뷰 공유 (Supabase) — 키가 없으면 모든 함수가 조용히 no-op/null
// 로컬(localStorage) 저장이 항상 먼저고, 여기는 그 위에 얹는 동기화 레이어.

import { getSupabase, ensureSession } from '@/shared/api/supabase'
import { getNickname } from '@/entities/user/model/profile'

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

// 내 평가를 서버에 업서트 (책 메타데이터도 함께 스냅샷)
export async function pushRating(book: RemoteBookInput, stars: number, review?: string): Promise<void> {
  const sb = getSupabase()
  if (!sb) return
  const userId = await ensureSession()
  if (!userId) return

  const { error: bookError } = await sb.from('books').upsert({
    id: book.id,
    title: book.title,
    authors: book.authors ?? [],
    publisher: book.publisher ?? null,
    year: book.year ?? null,
    thumbnail: book.thumbnail ?? null,
  })
  if (bookError) {
    console.warn('책 등록 실패:', bookError.message)
    return
  }

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
  if (error) console.warn('평가 동기화 실패:', error.message)
}

// 책 하나의 커뮤니티 통계 + 리뷰 목록
export async function fetchBookStats(bookId: string): Promise<RemoteBookStats | null> {
  const sb = getSupabase()
  if (!sb) return null

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
