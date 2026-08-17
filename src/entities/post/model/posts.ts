// 피드 포스트 타입 + 시드 데이터
// 실서비스: Supabase posts 테이블. 비로그인/오프라인 폴백은 localStorage + SEED_POSTS.

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

export const SEED_POSTS: Post[] = [
  {
    id: 'seed-p-1',
    authorId: 'seed-u-1',
    authorNickname: '달밤독서가',
    authorTypeCode: 'FIEW',
    content: '오늘 드디어 채식주의자 읽었는데... 너무 불편하고 좋았어요. 읽는 내내 뭔가 짓눌리는 느낌. 한강 작가님 노벨상 당연하다 싶었음',
    bookTitle: '채식주의자',
    likeCount: 14,
    commentCount: 3,
    ts: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'seed-p-2',
    authorId: 'seed-u-2',
    authorNickname: '책낼름',
    authorTypeCode: 'TCIR',
    content: '이번 달 목표 10권인데 3권째에서 멈춰있음... 분명 재밌는데 왜 손이 안 가지? 이거 뇌가 쉬고싶다는 신호인가요',
    bookTitle: null,
    likeCount: 9,
    commentCount: 7,
    ts: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    id: 'seed-p-3',
    authorId: 'seed-u-3',
    authorNickname: '페이지이동',
    authorTypeCode: null,
    content: '같은 책을 두 번 읽는 사람들 이해 못했는데... 아몬드를 두 번째 읽다가 처음 읽을 때랑 완전 다른 장면에서 울었어요. 그냥 다시 읽어보고 싶은 책이 생겼습니다',
    bookTitle: '아몬드',
    likeCount: 22,
    commentCount: 5,
    ts: Date.now() - 1000 * 60 * 60 * 5,
  },
  {
    id: 'seed-p-4',
    authorId: 'seed-u-4',
    authorNickname: '초식독자',
    authorTypeCode: 'FCER',
    content: 'SF 입문하고 싶은데 어디서부터 시작하면 좋을까요? 삼체 들었다가 포기했어서...',
    bookTitle: null,
    likeCount: 6,
    commentCount: 11,
    ts: Date.now() - 1000 * 60 * 60 * 8,
  },
  {
    id: 'seed-p-5',
    authorId: 'seed-u-5',
    authorNickname: '야행성서재',
    authorTypeCode: 'TCIW',
    content: '책 표지 보고 사는 게 취미인데 이번에 진짜 예쁜 걸 발견했어요. 내용은 아직 못 읽었지만 책장에 꽂아두기만 해도 기분이 좋아짐 ㅋㅋ',
    bookTitle: null,
    likeCount: 18,
    commentCount: 2,
    ts: Date.now() - 1000 * 60 * 60 * 14,
  },
]
