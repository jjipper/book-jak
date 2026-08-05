// 마이페이지 — 의견 나누기 글 좋아요 (localStorage 임시)
// TODO: 좋아요 Supabase 연동
//   - toggleLike → sb.from('likes').upsert/delete (target_id, target_type: 'question')
//   - likeCount 집계도 서버에서 count() 쿼리로 처리 필요

const STORAGE_KEY = 'book_liked_question_ids'

export function getLikedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isLiked(id: string): boolean {
  return getLikedIds().includes(id)
}

export function toggleLike(id: string): boolean {
  const ids = getLikedIds()
  const already = ids.includes(id)
  const next = already ? ids.filter((i) => i !== id) : [...ids, id]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return !already
}
