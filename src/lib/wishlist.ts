// 읽고싶어요 보관함 — localStorage 임시 저장
// 발견 탭(블라인드 카드)과 책 상세에서 담고, 마이 > 보관함에서 본다.

export interface WishlistRecord {
  bookId: string // 블라인드 책은 'blind-{id}', 카탈로그 책은 'b01', 검색 책은 'isbn-...'
  title: string
  author?: string
  publisher?: string
  illustCode?: string
  ts: number
}

const STORAGE_KEY = 'book_wishlist'

export function loadWishlist(): WishlistRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WishlistRecord[]) : []
  } catch {
    return []
  }
}


export function addToWishlist(record: WishlistRecord): void {
  if (typeof window === 'undefined') return
  const stored = loadWishlist()
  if (stored.some((r) => r.bookId === record.bookId)) return
  stored.unshift(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function removeFromWishlist(bookId: string): void {
  if (typeof window === 'undefined') return
  const stored = loadWishlist().filter((r) => r.bookId !== bookId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}
