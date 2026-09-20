// 토론 질문 좋아요 — Supabase likes가 유일한 소스. 쓰기는 로그인 필수.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

// 좋아요 여부는 화면이 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
const likedIds = new Set<string>()

export function isLiked(id: string): boolean {
  return likedIds.has(id)
}

// 화면이 목록을 받아오기 전에 isLiked()를 물어보는 경로(상세 딥링크)가 있어서
// 모듈이 로드되는 시점에 한 번 미리 채워둔다.
// ponytail: 목록 로딩보다 늦게 끝나면 첫 렌더는 '안 누름'으로 보인다. 그때 다시 누르면 upsert라 안전.
if (typeof window !== 'undefined') void getLikedIds()

export async function getLikedIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  likedIds.clear()
  if (!user) return []
  const { data } = await sb
    .from('likes')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'question')
  for (const r of (data ?? []) as { target_id: string }[]) likedIds.add(r.target_id)
  return [...likedIds]
}

export async function toggleLike(id: string): Promise<boolean> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const currently = likedIds.has(id)
  if (currently) {
    await sb.from('likes').delete()
      .eq('user_id', user.id).eq('target_id', id).eq('target_type', 'question')
    likedIds.delete(id)
  } else {
    await sb.from('likes').upsert(
      { user_id: user.id, target_id: id, target_type: 'question' },
      { onConflict: 'user_id,target_id,target_type' },
    )
    likedIds.add(id)
  }
  return !currently
}
