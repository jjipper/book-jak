import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

const FOLLOWING_CACHE = 'book_following_ids'
const FOLLOWER_CACHE = 'book_follower_ids'

function readCache(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

function writeCache(key: string, ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(ids))
}

export function isFollowing(id: string): boolean {
  return readCache(FOLLOWING_CACHE).includes(id)
}

export async function getFollowingIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return readCache(FOLLOWING_CACHE)
  const { data } = await sb.from('follows').select('followee_id').eq('follower_id', user.id)
  const ids = (data ?? []).map((r: { followee_id: string }) => r.followee_id)
  writeCache(FOLLOWING_CACHE, ids)
  return ids
}

export async function getFollowerIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return readCache(FOLLOWER_CACHE)
  const { data } = await sb.from('follows').select('follower_id').eq('followee_id', user.id)
  const ids = (data ?? []).map((r: { follower_id: string }) => r.follower_id)
  writeCache(FOLLOWER_CACHE, ids)
  return ids
}

export async function unfollowPerson(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('follows').delete().eq('follower_id', user.id).eq('followee_id', id)
  }
  writeCache(FOLLOWING_CACHE, readCache(FOLLOWING_CACHE).filter((i) => i !== id))
}

export async function toggleFollow(id: string): Promise<boolean> {
  const currently = isFollowing(id)
  if (currently) {
    await unfollowPerson(id)
    return false
  }
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('follows').insert({ follower_id: user.id, followee_id: id })
  }
  writeCache(FOLLOWING_CACHE, [...readCache(FOLLOWING_CACHE), id])
  return true
}
