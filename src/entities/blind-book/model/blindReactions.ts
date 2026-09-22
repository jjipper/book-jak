// 발견 탭 — 블라인드 북 넘어가기/서재 담기 반응. Supabase blind_reactions가 유일한 소스.
// 기록은 서버 라우트(app/api/blind/today POST)가 한다 — 책 isbn이 클라이언트에 없어서.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export interface BlindReaction {
  bookId: number
  action: 'save' | 'pass'
  ts: number
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
