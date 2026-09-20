// 피드 포스트 댓글 — comments 테이블 (posts.comment_count는 트리거가 동기화)

export interface PostComment {
  id: string
  postId: string
  authorId: string
  authorNickname: string
  authorTypeCode: string | null
  content: string
  ts: number
  /** 수정된 적 없으면 null */
  editedTs: number | null
}

export const COMMENT_MIN = 2
export const COMMENT_MAX = 500
