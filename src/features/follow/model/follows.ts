// 팔로우 — Supabase follows가 유일한 소스. 쓰기는 로그인 필수.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

// 팔로우 여부는 화면이 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
// getFollowingIds()가 서버에서 다시 채운다.
const followingIds = new Set<string>()

function isFollowing(id: string): boolean {
  return followingIds.has(id)
}

export async function getFollowingIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  followingIds.clear()
  if (!user) return []
  const { data } = await sb.from('follows').select('followee_id').eq('follower_id', user.id)
  for (const r of (data ?? []) as { followee_id: string }[]) followingIds.add(r.followee_id)
  return [...followingIds]
}

export async function getFollowerIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data } = await sb.from('follows').select('follower_id').eq('followee_id', user.id)
  return ((data ?? []) as { follower_id: string }[]).map((r) => r.follower_id)
}

export async function unfollowPerson(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('follows').delete().eq('follower_id', user.id).eq('followee_id', id)
  followingIds.delete(id)
}

export async function toggleFollow(id: string): Promise<boolean> {
  if (isFollowing(id)) {
    await unfollowPerson(id)
    return false
  }
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('follows').insert({ follower_id: user.id, followee_id: id })
  followingIds.add(id)
  return true
}
