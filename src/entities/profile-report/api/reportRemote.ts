// 취향 리포트가 서버에서 끌어오는 것들 — 인생책 3권, 배지 판정에 필요한 집계, 겹치는 책.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { loadBookRatings } from '@/entities/book-rating/model/bookRatings'

export interface FavoriteBook {
  bookId: string
  title: string
  thumbnail: string | null
}

/** 인생책 3권 — position 순. userId를 넘기면 그 사람 것(조회는 공개). */
export async function loadFavoriteBooks(userId?: string): Promise<FavoriteBook[]> {
  const sb = createSupabaseBrowser()
  let targetId = userId
  if (!targetId) {
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return []
    targetId = user.id
  }
  const { data } = await sb
    .from('favorite_books')
    .select('book_id, title, thumbnail, position')
    .eq('user_id', targetId)
    .order('position')
  return ((data ?? []) as { book_id: string; title: string; thumbnail: string | null }[])
    .map((r) => ({ bookId: r.book_id, title: r.title, thumbnail: r.thumbnail }))
}

/**
 * 인생책 목록을 통째로 교체한다.
 * ponytail: 최대 3행이라 지우고 다시 넣는다. 순서 바꾸기마다 upsert 충돌을 피하는 게 더 비싸다.
 */
export async function replaceFavoriteBooks(books: FavoriteBook[]): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { error: delError } = await sb.from('favorite_books').delete().eq('user_id', user.id)
  if (delError) throw delError
  if (!books.length) return

  const { error } = await sb.from('favorite_books').insert(
    books.slice(0, 3).map((b, i) => ({
      user_id: user.id,
      position: i + 1,
      book_id: b.bookId,
      title: b.title,
      thumbnail: b.thumbnail,
    })),
  )
  if (error) throw error
}

export interface ReportSignals {
  /** 토큰을 써서 공개한 블라인드 북 수 */
  blindRevealed: number
  /** 내가 남긴 책 추천 수 */
  recCount: number
  /** 오늘 또는 어제까지 이어진 연속 출석 일수 */
  attendanceStreak: number
}

/** 배지 판정용 집계 — 세 쿼리를 한 번에 */
export async function loadReportSignals(): Promise<ReportSignals> {
  const empty: ReportSignals = { blindRevealed: 0, recCount: 0, attendanceStreak: 0 }
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return empty

  const [reveals, recs, attendance] = await Promise.all([
    sb.from('token_ledger').select('id', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('reason', 'reveal'),
    sb.from('recommendations').select('id', { count: 'exact', head: true })
      .eq('author_id', user.id),
    sb.from('token_ledger').select('ref_date')
      .eq('user_id', user.id).eq('reason', 'attendance')
      .order('ref_date', { ascending: false }).limit(90),
  ])

  return {
    blindRevealed: reveals.count ?? 0,
    recCount: recs.count ?? 0,
    attendanceStreak: countStreak(((attendance.data ?? []) as { ref_date: string | null }[])
      .map((r) => r.ref_date)
      .filter((d): d is string => !!d)),
  }
}

/**
 * 내림차순 날짜 목록에서 오늘(또는 어제)부터 이어지는 연속 일수.
 * 어제까지도 인정하는 건, 오늘 출석 전에 리포트를 열었다고 streak이 0으로 보이면 안 되기 때문.
 * ponytail: 최근 90일만 본다 — 그 이상은 배지 조건(30일)에 영향이 없다.
 */
export function countStreak(datesDesc: string[]): number {
  if (!datesDesc.length) return 0
  const day = 86400000
  const toDay = (s: string) => Math.floor(Date.parse(`${s}T00:00:00Z`) / day)
  const today = Math.floor(Date.now() / day)

  const days = [...new Set(datesDesc.map(toDay))].sort((a, b) => b - a)
  if (today - days[0] > 1) return 0

  let streak = 1
  for (let i = 1; i < days.length; i++) {
    if (days[i - 1] - days[i] !== 1) break
    streak += 1
  }
  return streak
}

export interface SharedBooks {
  count: number
  titles: string[]
}

/**
 * 나와 상대가 "같이 높게 준 책" (양쪽 다 4점 이상).
 * ratings의 select 정책이 `using (true)`라 상대 평가를 그대로 읽을 수 있다 → 별도 RPC 없음.
 * 내 평가는 로컬 사본(제목 스냅샷이 여기 있다)을 쓴다.
 */
export async function loadSharedHighRated(otherUserId: string): Promise<SharedBooks> {
  const mine = new Map(
    loadBookRatings().filter((r) => r.stars >= 4).map((r) => [r.bookId, r.title ?? '제목 없음']),
  )
  if (mine.size === 0) return { count: 0, titles: [] }

  const { data } = await createSupabaseBrowser()
    .from('ratings')
    .select('book_id')
    .eq('user_id', otherUserId)
    .gte('stars', 4)

  const titles = ((data ?? []) as { book_id: string }[])
    .map((r) => mine.get(r.book_id))
    .filter((t): t is string => !!t)

  return { count: titles.length, titles }
}
