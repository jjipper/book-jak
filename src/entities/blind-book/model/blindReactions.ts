// 발견 탭 — 블라인드 책 저장/패스 반응. Supabase blind_reactions가 유일한 소스.
// 비로그인이면 기록하지 않는다 (반응은 개인 데이터라 익명으로 쌓아둘 곳이 없다).

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export interface BlindReaction {
  bookId: number
  action: 'save' | 'pass'
  ts: number
}

/** 화면 흐름을 막지 않도록 fire-and-forget. 실패해도 카드 넘김은 그대로 진행된다. */
export function recordBlindReaction(bookId: number, action: 'save' | 'pass'): void {
  void (async () => {
    const sb = createSupabaseBrowser()
    const { data: { user } } = await sb.auth.getUser()
    if (!user) return
    await sb.from('blind_reactions').upsert(
      { user_id: user.id, blind_book_id: bookId, action },
      { onConflict: 'user_id,blind_book_id' },
    )
  })()
}

export async function loadBlindReactions(): Promise<BlindReaction[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data } = await sb
    .from('blind_reactions')
    .select('blind_book_id, action, created_at')
    .eq('user_id', user.id)
  return ((data ?? []) as { blind_book_id: number; action: 'save' | 'pass'; created_at: string }[])
    .map((r) => ({ bookId: r.blind_book_id, action: r.action, ts: new Date(r.created_at).getTime() }))
}

export async function getReactionCounts(): Promise<{ saved: number; passed: number }> {
  const reactions = await loadBlindReactions()
  return {
    saved: reactions.filter((r) => r.action === 'save').length,
    passed: reactions.filter((r) => r.action === 'pass').length,
  }
}
