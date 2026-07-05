// Phase 2 — 블라인드 책 평가 데이터 저장 (localStorage 임시)

export interface BlindRatingRecord {
  bookId: number
  title: string
  stars: number
  reactions: string[]
  tags: string[]
  ts: number
}

const STORAGE_KEY = 'book_blind_ratings'

export function saveBlindRating(record: BlindRatingRecord): void {
  if (typeof window === 'undefined') return
  const stored = loadBlindRatings()
  stored.push(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
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
