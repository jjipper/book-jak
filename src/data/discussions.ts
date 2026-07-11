// Phase 4 — 질문 기반 토론 시드 데이터
// authorId는 MOCK_PEOPLE의 id를 참조. bookId가 null이면 "자유주제".

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

export const SEED_QUESTIONS: DiscussionQuestion[] = [
  { id: 'q01', bookId: 2, authorId: 'p05', text: '결말에서 화자가 진짜 범인이 맞다고 생각하세요? 저는 다시 읽고도 확신이 안 서요.', ts: 1735689600000, likeCount: 12 },
  { id: 'q02', bookId: 1, authorId: 'p03', text: '아무 일도 안 일어나는 소설인데 왜 이렇게 계속 생각나죠? 다들 왜 이 책이 좋았어요?', ts: 1735776000000, likeCount: 8 },
  { id: 'q03', bookId: null, authorId: 'p08', text: '완독 못 하고 포기한 책, 나중에 다시 읽어서 성공한 적 있나요? 저는 항상 포기가 승리함…', ts: 1735862400000, likeCount: 21 },
  { id: 'q04', bookId: 5, authorId: 'p07', text: '열린 결말 단편집인데 다들 어떤 결말로 상상하셨어요? 저는 완전 반대로 상상했어요.', ts: 1735948800000, likeCount: 5 },
  { id: 'q05', bookId: null, authorId: 'p10', text: 'SF 읽고 사업 아이템 떠올린 적 있는 사람? 저만 이런 거 아니죠?', ts: 1736035200000, likeCount: 3 },
  { id: 'q06', bookId: 4, authorId: 'p11', text: '이 책 1950년대 얘긴데 지금 SNS 얘기 같지 않아요? 다들 어떤 부분에서 뜨끔했어요?', ts: 1736121600000, likeCount: 9 },
]

export const SEED_ANSWERS: DiscussionAnswer[] = [
  { id: 'a01', questionId: 'q01', authorId: 'p08', text: '저는 범인 맞다고 봐요. 기억이 흐려지는 와중에도 디테일은 너무 정확하게 남아있어서.', ts: 1735693200000 },
  { id: 'a02', questionId: 'q01', authorId: 'p01', text: '저도 헷갈렸는데 두 번째 읽으니까 복선이 다 보이더라고요.', ts: 1735696800000 },
  { id: 'a03', questionId: 'q02', authorId: 'p12', text: '저도 똑같아요. 근데 그 "아무 일도 없음"이 오히려 제일 무서운 부분 같아요.', ts: 1735779600000 },
  { id: 'a04', questionId: 'q03', authorId: 'p04', text: '저는 있어요! 3년 전에 포기한 거 최근에 다시 읽었더니 이번엔 완독함.', ts: 1735866000000 },
  { id: 'a05', questionId: 'q04', authorId: 'p06', text: '저는 완전 열린 채로 남겨두는 게 좋아서 결말을 정하지 않고 그냥 즐겼어요.', ts: 1735952400000 },
]
