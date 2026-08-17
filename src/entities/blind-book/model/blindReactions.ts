// 발견 탭 — 블라인드 책 저장/패스 반응 저장 (localStorage)
// TODO (Phase 2-2): Supabase blind_reactions 테이블에도 동기화

export interface BlindReaction {
  bookId: number
  action: 'save' | 'pass'
  ts: number
}

const STORAGE_KEY = 'blind_reactions'

export function recordBlindReaction(bookId: number, action: 'save' | 'pass'): void {
  if (typeof window === 'undefined') return
  const stored = loadBlindReactions()
  stored.push({ bookId, action, ts: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
}

export function loadBlindReactions(): BlindReaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BlindReaction[]) : []
  } catch {
    return []
  }
}

export function getReactionCounts(): { saved: number; passed: number } {
  const reactions = loadBlindReactions()
  return {
    saved: reactions.filter((r) => r.action === 'save').length,
    passed: reactions.filter((r) => r.action === 'pass').length,
  }
}
