// 피드 포스트 댓글 — comments 테이블 (posts.comment_count는 트리거가 동기화)

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorNickname: string
  content: string
  ts: number
}

export const COMMENT_MIN = 2
export const COMMENT_MAX = 500
