import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

const LIKED_CACHE = 'book_liked_question_ids'

function readCache(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LIKED_CACHE)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

export function isLiked(id: string): boolean {
  return readCache().includes(id)
}

export async function getLikedIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return readCache()
  const { data } = await sb
    .from('likes')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'question')
  const ids = (data ?? []).map((r: { target_id: string }) => r.target_id)
  localStorage.setItem(LIKED_CACHE, JSON.stringify(ids))
  return ids
}

export async function toggleLike(id: string): Promise<boolean> {
  const currently = isLiked(id)
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    if (currently) {
      await sb.from('likes').delete().eq('user_id', user.id).eq('target_id', id)
    } else {
      await sb.from('likes').insert({ user_id: user.id, target_id: id, target_type: 'question' })
    }
  }
  const ids = readCache()
  localStorage.setItem(LIKED_CACHE, JSON.stringify(currently ? ids.filter((i) => i !== id) : [...ids, id]))
  return !currently
}
