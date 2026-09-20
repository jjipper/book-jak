// 질문 기반 토론 타입 — 데이터는 Supabase discussion_* 테이블이 유일한 소스.
// bookId가 null이면 "자유주제".

export interface DiscussionAnswer {
  id: string
  questionId: string
  authorId: string
  text: string
  ts: number
}

export interface DiscussionQuestion {
  id: string
  bookId: number | null
  authorId: string
  text: string
  ts: number
  likeCount?: number
}
