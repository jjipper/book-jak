// 피드 포스트 타입 — 데이터는 Supabase posts 테이블이 유일한 소스.

export interface Post {
  id: string
  authorId: string
  authorNickname: string
  authorTypeCode: string | null
  content: string
  bookTitle: string | null
  likeCount: number
  commentCount: number
  ts: number
}
