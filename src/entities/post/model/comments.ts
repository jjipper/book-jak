// 포스트 댓글 타입 + 시드 데이터
// 실서비스: Supabase post_comments 테이블. 비로그인/오프라인 폴백은 localStorage + SEED_COMMENTS.

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

export const SEED_COMMENTS: PostComment[] = [
  {
    id: 'seed-c-1',
    postId: 'seed-p-3',
    authorId: 'seed-u-1',
    authorNickname: '달밤독서가',
    authorTypeCode: 'FIEW',
    content: '저도 재독하면 우는 지점이 매번 달라져요. 그게 재독하는 이유인 것 같아요',
    ts: Date.now() - 1000 * 60 * 60 * 4,
    editedTs: null,
  },
  {
    id: 'seed-c-2',
    postId: 'seed-p-3',
    authorId: 'seed-u-5',
    authorNickname: '야행성서재',
    authorTypeCode: 'TCIW',
    content: '아몬드는 진짜 나이대별로 다르게 읽히더라구요',
    ts: Date.now() - 1000 * 60 * 60 * 3,
    editedTs: null,
  },
  {
    id: 'seed-c-3',
    postId: 'seed-p-1',
    authorId: 'seed-u-4',
    authorNickname: '초식독자',
    authorTypeCode: 'FCER',
    content: '저는 아직 못 읽었는데 마음 단단히 먹고 봐야겠네요',
    ts: Date.now() - 1000 * 60 * 20,
    editedTs: null,
  },
]
