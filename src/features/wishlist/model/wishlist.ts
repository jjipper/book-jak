// 내 서재(서재에 담기) — 원본은 Supabase wishlist 테이블(api/wishlistRemote.ts)이고,
// localStorage는 동기로 읽는 화면(마이 카운트 등)을 위한 사본이다. syncWishlist()가 서버와 맞춘다.
// 발견 탭·책 상세에서 담고, 마이 > 내 서재에서 본다.

import { deleteWishlist, fetchWishlist, pushWishlist } from '@/features/wishlist/api/wishlistRemote'

export interface WishlistRecord {
  bookId: string // 블라인드 책은 'blind-{id}', 카탈로그 책은 'b01', 검색 책은 'isbn-...'
  title: string
  author?: string
  publisher?: string
  cover?: string // 표지 URL (검색 책)
  illustCode?: string
  ts: number
}

const STORAGE_KEY = 'book_wishlist'
// 마지막으로 서버와 맞춘 시각 — 없으면 아직 한 번도 이관하지 않은 기기
const SYNCED_AT_KEY = 'book_wishlist_synced_at'

export function loadWishlist(): WishlistRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as WishlistRecord[]) : []
  } catch {
    return []
  }
}

function saveWishlist(records: WishlistRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

// 로컬에 바로 담고 서버로 올린다 — 실패해도 다음 syncWishlist 때 다시 올라간다
export function addToWishlist(record: WishlistRecord): void {
  if (typeof window === 'undefined') return
  const stored = loadWishlist()
  if (stored.some((r) => r.bookId === record.bookId)) return
  stored.unshift(record)
  saveWishlist(stored)
  pushWishlist([record]).catch(() => {})
}

export function removeFromWishlist(bookId: string): void {
  if (typeof window === 'undefined') return
  saveWishlist(loadWishlist().filter((r) => r.bookId !== bookId))
  deleteWishlist(bookId).catch(() => {})
}

// 서버 기준으로 로컬 사본을 맞춘다. 서버에 없는 로컬 항목은
// - 마지막 sync 이후에 담은 것(첫 sync면 전부 — 기존 로컬 항목 이관)이면 서버로 올리고 유지,
// - 그 전에 담은 것이면 다른 기기에서 뺀 것이므로 버린다.
export async function syncWishlist(): Promise<WishlistRecord[]> {
  const server = await fetchWishlist()
  if (!server) return loadWishlist()
  const syncedAt = Number(localStorage.getItem(SYNCED_AT_KEY) ?? 0)
  const serverIds = new Set(server.map((r) => r.bookId))
  const pending = loadWishlist().filter((r) => !serverIds.has(r.bookId) && r.ts > syncedAt)
  if (pending.length > 0) {
    try {
      await pushWishlist(pending)
    } catch {
      // 올리지 못했으면 syncedAt을 옮기지 않는다 — 다음 번에 다시 시도
      const merged = [...pending, ...server]
      saveWishlist(merged)
      return merged
    }
  }
  const merged = [...pending, ...server].sort((a, b) => b.ts - a.ts)
  saveWishlist(merged)
  localStorage.setItem(SYNCED_AT_KEY, String(Date.now()))
  return merged
}
