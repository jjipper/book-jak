// 마이페이지 — 팔로우 (localStorage 임시, MOCK_PEOPLE id만 대상)

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

export function followPerson(id: string): void {
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

// 나를 팔로우하는 사람. 실서비스에서는 서버가 내려주는 값, 현재는 고정 목업.
const MOCK_FOLLOWER_IDS = ['p02', 'p04', 'p07', 'p09', 'p11']

export function getFollowerIds(): string[] {
  return MOCK_FOLLOWER_IDS
}
