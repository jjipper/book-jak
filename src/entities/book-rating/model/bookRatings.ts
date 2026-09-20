// 평가 탭 — 책 별점·리뷰
// 원본은 Supabase ratings 테이블이고(api/ratingsRemote.ts), 여기 localStorage는
// 동기로 읽어야 하는 화면들을 위한 내 평가 사본이다. syncMyRatings()가 서버 기준으로 덮어쓴다.
// 같은 책을 다시 평가하면 덮어쓴다(업서트). 활동 점수는 최초 평가 때만 적립.

import { recordActivity } from '@/shared/lib/activity'

export interface BookRatingRecord {
  bookId: string // 카탈로그 책은 'b01', 카카오 검색 책은 'isbn-{ISBN13}'
  title?: string // 마이페이지 등에서 카탈로그 조회 없이 표시하기 위한 스냅샷
  categoryName?: string // 알라딘 장르 분석용
  stars: number
  review?: string
  ts: number
}

const STORAGE_KEY = 'book_ratings'

export function loadBookRatings(): BookRatingRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BookRatingRecord[]) : []
  } catch {
    return []
  }
}

/** 서버에서 받아온 내 평가로 로컬 사본을 통째로 교체 (ratingsRemote.syncMyRatings 전용) */
export function replaceBookRatings(records: BookRatingRecord[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getBookRating(bookId: string): BookRatingRecord | undefined {
  return loadBookRatings().find((r) => r.bookId === bookId)
}

export function saveBookRating(record: BookRatingRecord): void {
  if (typeof window === 'undefined') return
  const stored = loadBookRatings()
  const existing = stored.findIndex((r) => r.bookId === record.bookId)
  const isFirstRating = existing < 0
  const hadReview = !isFirstRating && !!stored[existing].review?.trim()

  if (isFirstRating) stored.push(record)
  else stored[existing] = record
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))

  if (isFirstRating) recordActivity('book_rating')
  if (!hadReview && record.review && record.review.trim().length > 0) recordActivity('review')
}

// 별점을 다시 눌러 취소했을 때 — 평가 기록 자체를 삭제
export function removeBookRating(bookId: string): void {
  if (typeof window === 'undefined') return
  const stored = loadBookRatings().filter((r) => r.bookId !== bookId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}
