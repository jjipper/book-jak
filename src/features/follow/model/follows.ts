// TODO: 팔로우/언팔로우 Supabase 연동
//   - followPerson/unfollowPerson → sb.from('follows').insert/delete
//   - getFollowingIds → sb.from('follows').select('followee_id').eq('follower_id', myId)
//   - getFollowerIds → sb.from('follows').select('follower_id').eq('followee_id', myId)
//   - 현재는 MOCK_PEOPLE id만 로컬에 저장, 실서비스에서는 UUID 기반

const STORAGE_KEY = 'book_following_ids'

export function getFollowingIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isFollowing(id: string): boolean {
  return getFollowingIds().includes(id)
}

function followPerson(id: string): void {
  if (typeof window === 'undefined') return
  const ids = getFollowingIds()
  if (ids.includes(id)) return
  ids.push(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function unfollowPerson(id: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(getFollowingIds().filter((i) => i !== id)))
}

export function toggleFollow(id: string): boolean {
  const nowFollowing = !isFollowing(id)
  if (nowFollowing) followPerson(id)
  else unfollowPerson(id)
  return nowFollowing
}

// TODO: 팔로워 목록 서버 연동 — 현재는 고정 목업 ID
const MOCK_FOLLOWER_IDS = ['p02', 'p04', 'p07', 'p09', 'p11']

export function getFollowerIds(): string[] {
  return MOCK_FOLLOWER_IDS
}
