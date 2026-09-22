// 레거시 — 예전 블라인드 북 평가(localStorage). 새로 쌓이지 않고, 사람 매칭이 옛 취향 태그를 읽을 때만 쓴다.

export interface BlindRatingRecord {
  bookId: number
  title: string
  stars: number
  tags: string[]
  ts: number
}

const STORAGE_KEY = 'book_blind_ratings'

export function loadBlindRatings(): BlindRatingRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BlindRatingRecord[]) : []
  } catch {
    return []
  }
}
