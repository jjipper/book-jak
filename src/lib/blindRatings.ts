// Phase 2 — 블라인드 책 평가 데이터 저장 (localStorage 임시)

import { recordActivity } from '@/lib/activity'

export interface BlindRatingRecord {
  bookId: number
  title: string
  stars: number // 궁금해요 = 4점 상당의 긍정 신호로 기록
  tags: string[]
  ts: number
}

const STORAGE_KEY = 'book_blind_ratings'

export function saveBlindRating(record: BlindRatingRecord): void {
  if (typeof window === 'undefined') return
  const stored = loadBlindRatings()
  stored.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
  recordActivity('blind_rating')
}

export function loadBlindRatings(): BlindRatingRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BlindRatingRecord[]) : []
  } catch {
    return []
  }
}
