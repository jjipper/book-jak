// 피드 포스트 타입 — 데이터는 Supabase posts 테이블이 유일한 소스.

export interface Post {
  id: string
  authorId: string
  authorNickname: string
  authorTypeCode: string | null
  content: string
  /** 첨부한 책 — 셋 다 있거나 셋 다 null */
  bookTitle: string | null
  bookIsbn: string | null
  bookCover: string | null
  likeCount: number
  commentCount: number
  ts: number
  /** 수정된 적 없으면 null */
  editedTs: number | null
}
