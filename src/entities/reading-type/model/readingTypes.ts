export type TypeCode =
  | 'FIEW' | 'FIER' | 'FIGR' | 'FIGW'
  | 'FCER' | 'FCEW' | 'FCGR' | 'FCGW'
  | 'TIER' | 'TIEW' | 'TIGR' | 'TIGW'
  | 'TCER' | 'TCEW' | 'TCGR' | 'TCGW'

export type RarityLevel = 'most-common' | 'common' | 'rare' | 'very-rare' | 'ultra-rare'
type ParticleType = 'bubble' | 'ember' | 'mote' | 'cross' | 'star' | 'leaf' | 'spark' | 'question'

export type StatKey = '몰입력' | '인내심' | '감수성' | '허세력' | '완독력'

export interface ReadingType {
  code: TypeCode
  name: string
  emoji: string
  rarityText: string
  rarityLevel: RarityLevel
  rarityPct: number
  tagline: string
  /** 풀 리포트 상단 유형 설명 (5~6줄) */
  description: string
  accent: string
  habitatColors: { h1: string; h2: string }
  particle: ParticleType
  baseStats: Record<StatKey, number>
  /** 책 읽으면서 자주 하는 생각 3개 */
  thoughts: string[]
  compatibility: {
    match: TypeCode
    matchEmoji: string
    matchName: string
    matchLine: string
    opposite: TypeCode
    oppEmoji: string
    oppName: string
    oppLine: string
  }
  warning: { alert: string; sideEffect: string }
  /** 같은 유형이 좋아하는 책 — 분야/책 성격 단위 */
  books: { emoji: string; genre: string; note: string }[]
}

/** 유형 코드 한 글자 → 취향 키워드 (유형 카드 칩 · 결과 아이콘 공용) */
export const AXIS_KEYWORDS: Record<string, string> = {
  F: '감정 이입', T: '논리 분석',
  I: '깊은 몰입', C: '차분한 사색',
  E: '현실 도피', G: '자기 성장',
  R: '현실 기반', W: '환상 세계',
}

export const READING_TYPES: Record<TypeCode, ReadingType> = {
  FIEW: {
    code: 'FIEW',
    name: '프로 잠수부',
    emoji: '🤿',
    rarityText: '전체의 7.6% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 7.6,
    tagline: '책 펴는 순간 책 속 세계로 사라지는 사람',
    description: '책 속 세계에 통째로 뛰어드는 몰입형 독서 성향이에요. 책을 읽을 때 주인공 감정에 그대로 이입하는 걸 좋아하고, 한번 빠지면 시간 가는 줄 몰라요. 현실보다 책 속 세계가 더 생생하게 느껴질 때가 많아서, 좋아하는 이야기가 끝나면 한동안 그 세계에서 못 빠져나와요.',
    accent: '#2dd4bf',
    habitatColors: { h1: '#06222b', h2: '#0a3540' },
    particle: 'bubble',
    baseStats: { 몰입력: 94, 인내심: 22, 감수성: 96, 허세력: 40, 완독력: 61 },
    thoughts: ['딱 한 챕터만 더 읽고 자야지', '헉 벌써 새벽 3시야?', '다음 권 지금 바로 결제해야 해'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '너가 분석하면 내가 울어줄게',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '소설을 왜 읽냐고? 나가.',
    },
    warning: {
      alert: '책 볼 때 옆에서 100번 불러도 못 들음',
      sideEffect: '새벽 감성으로 책 읽다가 울고 있음',
    },
    books: [
      { emoji: '🐉', genre: '대서사 판타지', note: '10권짜리 시리즈일수록 좋아' },
      { emoji: '🌊', genre: '몰입형 장편소설', note: '첫 장부터 끌고 들어가는 이야기' },
      { emoji: '💌', genre: '로맨스 소설', note: '주인공이랑 같이 설레고 같이 아픔' },
      { emoji: '🕰️', genre: '타임슬립 소설', note: '여기 말고 다른 시간으로 도망' },
      { emoji: '🏰', genre: '웹소설 원작 장편', note: '연재 기다리다 단행본까지 삼' },
      { emoji: '🎭', genre: '인생 드라마 소설', note: '인물 인생을 통째로 따라감' },
    ],
  },

  FIER: {
    code: 'FIER',
    name: '심해 표류자',
    emoji: '🏊',
    rarityText: '전체의 3.6% · 매우 희귀',
    rarityLevel: 'very-rare',
    rarityPct: 3.6,
    tagline: '현실이 힘들 때 다른 세계로 도망치는 사람',
    description: '책에서 위로를 찾는 공감형 독서 성향이에요. 책을 읽을 때 내 얘기 같은 문장을 발견하는 걸 좋아하고, 등장인물의 감정을 내 일처럼 느껴요. 현실이 버거운 날일수록 책을 더 찾게 되고, 다 읽고 나면 마음이 조금 가벼워져 있어요.',
    accent: '#f87171',
    habitatColors: { h1: '#1a0808', h2: '#2a1010' },
    particle: 'mote',
    baseStats: { 몰입력: 85, 인내심: 44, 감수성: 97, 허세력: 25, 완독력: 70 },
    thoughts: ['이거 완전 내 얘기잖아', '작가님 저 몰래 보셨어요?', '이 문장 캡처해둬야지'],
    compatibility: {
      match: 'FCGR', matchEmoji: '🌙', matchName: '한 문장에 머무는 사람',
      matchLine: '같이 밑줄 긋자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '감동은 됐고 정보를 줘 / 정 없다 진짜',
    },
    warning: {
      alert: '슬픈 장면 나오면 지하철에서도 눈물 참기 실패',
      sideEffect: '책 한 권 읽고 갑자기 인생 돌아보는 중',
    },
    books: [
      { emoji: '🌿', genre: '위로 에세이', note: '읽는 것만으로 토닥토닥' },
      { emoji: '🏠', genre: '가족 소설', note: '괜히 엄마한테 전화하게 됨' },
      { emoji: '🌧️', genre: '잔잔한 일상 소설', note: '큰 사건 없이 마음이 풀림' },
      { emoji: '🩹', genre: '힐링 소설', note: '고민 상담소 같은 이야기' },
      { emoji: '✉️', genre: '편지·일기 형식 책', note: '누군가의 속마음 엿보기' },
      { emoji: '📷', genre: '청춘 소설', note: '그때의 나를 만나는 기분' },
    ],
  },

  FIGR: {
    code: 'FIGR',
    name: '이야기로 자라나는 사람',
    emoji: '🌱',
    rarityText: '전체의 6.1% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.1,
    tagline: '울면서 읽었는데 어느새 더 나은 사람이 됨.',
    description: '이야기를 통해 조금씩 자라는 성장형 독서 성향이에요. 책을 읽을 때 인물이 변해가는 과정을 따라가는 걸 좋아하고, 마음에 남은 장면은 꼭 메모해둬요. 감동을 그냥 흘려보내지 않고 내 삶에 하나쯤 적용해보려 해서, 인생책 목록이 자주 바뀌어요.',
    accent: '#4ade80',
    habitatColors: { h1: '#061a0c', h2: '#0c2812' },
    particle: 'leaf',
    baseStats: { 몰입력: 88, 인내심: 72, 감수성: 91, 허세력: 33, 완독력: 84 },
    thoughts: ['나도 저렇게 살아봐야지', '인생책 또 갱신이다', '이 부분 독서노트에 적어야지'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '너는 머리로, 나는 가슴으로',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '그렇게 빨리 읽으면 남는 게 있어?',
    },
    warning: {
      alert: '책 추천받으면 거절을 못 해서 장바구니가 터짐',
      sideEffect: '책 덮자마자 다이어리에 인생 계획 새로 씀',
    },
    books: [
      { emoji: '🌱', genre: '성장 소설', note: '주인공이랑 같이 한 뼘 자람' },
      { emoji: '🧭', genre: '실화 기반 소설', note: '진짜 있었던 일이라 더 울림' },
      { emoji: '📖', genre: '인생 에세이', note: '먼저 살아본 사람의 이야기' },
      { emoji: '👣', genre: '인물 평전', note: '위인도 흔들렸다는 게 위로' },
      { emoji: '🏃', genre: '도전기·여행기', note: '읽고 나면 뭐라도 하고 싶어짐' },
      { emoji: '🍀', genre: '휴먼 드라마', note: '착한 사람들이 이기는 이야기' },
    ],
  },

  FIGW: {
    code: 'FIGW',
    name: '환상 속에서 나를 찾아가는 사람',
    emoji: '🦋',
    rarityText: '전체의 10.6% · 가장 흔함',
    rarityLevel: 'most-common',
    rarityPct: 10.6,
    tagline: '판타지 속에서 진짜 나를 발견함.',
    description: '판타지 속에서 나를 발견하는 상상형 독서 성향이에요. 책을 읽을 때 새로운 세계관에 빠져드는 걸 좋아하고, 주인공의 모험을 내 이야기처럼 따라가요. 가상의 세계인데도 읽고 나면 현실의 나에게 남는 게 있고, 시리즈가 끝나면 한동안 금단현상에 시달려요.',
    accent: '#c084fc',
    habitatColors: { h1: '#160a26', h2: '#1e1030' },
    particle: 'star',
    baseStats: { 몰입력: 93, 인내심: 75, 감수성: 89, 허세력: 42, 완독력: 78 },
    thoughts: ['이 세계관에서 나는 무슨 직업일까', '주인공 완전 나잖아', '완결 나면 난 이제 뭐 읽지'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '우리 세계관 합치자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '판타지는 도피야 / 도피가 어때서',
    },
    warning: {
      alert: '세계관 설명 시작하면 30분 동안 안 끝남',
      sideEffect: '친구들을 소설 속 캐릭터로 분류하기 시작함',
    },
    books: [
      { emoji: '🧙', genre: '마법 학교 판타지', note: '입학 통지서 아직 기다리는 중' },
      { emoji: '🗺️', genre: '모험 판타지', note: '지도 첨부된 책이면 일단 삼' },
      { emoji: '🦄', genre: '동화풍 판타지', note: '어른이라 더 좋은 동화' },
      { emoji: '🌙', genre: '이세계 성장물', note: '다른 세계에서 찾는 진짜 나' },
      { emoji: '🐲', genre: '시리즈 판타지', note: '한 권으로 끝나면 섭섭함' },
      { emoji: '✨', genre: '신화 재해석 소설', note: '아는 이야기, 새로운 시선' },
    ],
  },

  FCER: {
    code: 'FCER',
    name: '책으로 마음을 잔잔하게 데우는 사람',
    emoji: '🍵',
    rarityText: '전체의 3.6% · 매우 희귀',
    rarityLevel: 'very-rare',
    rarityPct: 3.6,
    tagline: '빨리 안 읽어. 천천히 따뜻하게 스며들어.',
    description: '천천히 음미하며 마음을 데우는 힐링형 독서 성향이에요. 책을 읽을 때 따뜻한 분위기와 잔잔한 문장을 좋아하고, 한 권을 오래 곁에 두고 조금씩 읽어요. 줄거리보다 읽는 시간 자체를 즐기는 편이라, 차 한 잔과 좋아하는 자리가 갖춰져야 비로소 책을 펼쳐요.',
    accent: '#fb923c',
    habitatColors: { h1: '#1c0e06', h2: '#28160a' },
    particle: 'mote',
    baseStats: { 몰입력: 64, 인내심: 80, 감수성: 92, 허세력: 28, 완독력: 66 },
    thoughts: ['오늘은 딱 열 페이지만 천천히', '이 분위기 너무 좋다', '차 식기 전에 한 장만 더'],
    compatibility: {
      match: 'FCGR', matchEmoji: '🌙', matchName: '한 문장에 머무는 사람',
      matchLine: '우리 진도 비슷하네',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '좀 천천히 읽어... / 시간 아까워',
    },
    warning: {
      alert: '카페 조명이 별로면 책을 안 펼침',
      sideEffect: '한 권을 한 달 넘게 들고 다녀서 책이 닳음',
    },
    books: [
      { emoji: '☕', genre: '동네 가게 힐링 소설', note: '서점, 빵집, 세탁소 같은 곳' },
      { emoji: '🍂', genre: '계절 에세이', note: '창밖 풍경이랑 같이 읽기' },
      { emoji: '🐈', genre: '소소한 일상 에세이', note: '고양이랑 산책 같은 이야기' },
      { emoji: '🍳', genre: '음식 에세이', note: '읽다 보면 배고파짐' },
      { emoji: '🌾', genre: '시골 생활기', note: '느리게 사는 대리만족' },
      { emoji: '📜', genre: '짧은 시집', note: '한 편 읽고 한참 머물기' },
    ],
  },

  FCEW: {
    code: 'FCEW',
    name: '여백에 잠기는 몽상가',
    emoji: '🌫️',
    rarityText: '전체의 7.6% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 7.6,
    tagline: '책 펴놓고 딴생각하다 우주여행 다녀옴.',
    description: '문장 사이 여백에서 상상을 펼치는 몽상형 독서 성향이에요. 책을 읽을 때 줄거리보다 분위기와 장면의 느낌을 좋아하고, 한 문장에서 떠오른 생각을 따라 한참 딴 세상에 다녀와요. 진도는 느리지만 머릿속엔 책보다 더 큰 이야기가 펼쳐져 있어요.',
    accent: '#a78bfa',
    habitatColors: { h1: '#100c20', h2: '#18122e' },
    particle: 'star',
    baseStats: { 몰입력: 60, 인내심: 55, 감수성: 95, 허세력: 30, 완독력: 45 },
    thoughts: ['방금 뭐 읽었더라?', '이 장면 영화로 나오면 좋겠다', '같은 페이지 몇 번째 읽는 거지'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '같이 멍때리자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '핵심이 뭐야? / 핵심은 분위기지...',
    },
    warning: {
      alert: '같은 페이지 다섯 번 읽는 건 정상 범위임',
      sideEffect: '책보다 책 읽는 내 모습 사진부터 찍음',
    },
    books: [
      { emoji: '🌫️', genre: '몽환적인 소설', note: '꿈인지 현실인지 헷갈리는 이야기' },
      { emoji: '🎨', genre: '그림 많은 아트북', note: '글보다 여백을 오래 봄' },
      { emoji: '🌌', genre: '짧은 SF 단편', note: '한 편 읽고 우주 한 바퀴' },
      { emoji: '🪞', genre: '시집', note: '한 줄에 상상 백 줄' },
      { emoji: '🎐', genre: '조용하고 이상한 소설', note: '설명 안 되는 분위기가 매력' },
      { emoji: '🕯️', genre: '동화 같은 어른 소설', note: '읽는 동안 둥둥 떠 있는 기분' },
    ],
  },

  FCGR: {
    code: 'FCGR',
    name: '한 문장에 머무는 사람',
    emoji: '🌙',
    rarityText: '전체의 6.1% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.1,
    tagline: '같은 페이지 세 번 읽음. 진도 안 나가는 게 아니라 음미 중.',
    description: '한 문장을 오래 곱씹는 정독형 독서 성향이에요. 책을 읽을 때 마음을 건드리는 문장을 발견하는 걸 좋아하고, 좋은 구절엔 꼭 밑줄을 긋거나 옮겨 적어요. 빨리 읽기보다 깊이 읽는 게 중요해서 진도는 느리지만, 다 읽은 책은 오래도록 기억에 남아요.',
    accent: '#f0a6c0',
    habitatColors: { h1: '#1a1426', h2: '#241932' },
    particle: 'mote',
    baseStats: { 몰입력: 72, 인내심: 90, 감수성: 94, 허세력: 35, 완독력: 68 },
    thoughts: ['이 문장 진짜 미쳤다', '필사 노트 어디 뒀더라', '이거 단톡방에 보내야지'],
    compatibility: {
      match: 'FIEW', matchEmoji: '🤿', matchName: '프로 잠수부',
      matchLine: '너는 빠지고 나는 머물고',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '음미를 해야지 / 그러다 한 권도 못 끝내',
    },
    warning: {
      alert: '좋은 문장 나오면 단톡방에 사진 폭격함',
      sideEffect: '밑줄이 너무 많아서 밑줄 없는 줄 찾는 게 더 빠름',
    },
    books: [
      { emoji: '✍️', genre: '문장 좋은 에세이', note: '밑줄 긋다가 펜 잉크 다 씀' },
      { emoji: '📜', genre: '시집', note: '한 편에 하루씩' },
      { emoji: '🖋️', genre: '필사하기 좋은 고전', note: '오래 살아남은 문장들' },
      { emoji: '🌙', genre: '작가 산문집', note: '작가의 생각을 천천히 따라감' },
      { emoji: '💬', genre: '명문장 모음집', note: '좋은 문장만 골라 담은 책' },
      { emoji: '🏅', genre: '문학상 수상 소설', note: '문장 하나하나 공들인 책' },
    ],
  },

  FCGW: {
    code: 'FCGW',
    name: '우화에서 진심을 찾는 사람',
    emoji: '🦊',
    rarityText: '전체의 10.6% · 가장 흔함',
    rarityLevel: 'most-common',
    rarityPct: 10.6,
    tagline: '동화책에도 우는 어른. 감수성 풀충전 상태.',
    description: '짧은 이야기에서 큰 의미를 찾는 감성형 독서 성향이에요. 책을 읽을 때 은유와 상징 뒤에 숨은 진심을 발견하는 걸 좋아하고, 동화나 그림책에도 쉽게 마음이 움직여요. 얇은 책 한 권으로 일주일을 곱씹을 수 있고, 모든 이야기에서 나만의 교훈을 하나씩 챙겨요.',
    accent: '#f97316',
    habitatColors: { h1: '#1a0c06', h2: '#26120a' },
    particle: 'leaf',
    baseStats: { 몰입력: 76, 인내심: 82, 감수성: 99, 허세력: 24, 완독력: 80 },
    thoughts: ['이거 사실 어른을 위한 책이잖아', '이 동물이 뜻하는 건 뭘까', '어릴 땐 이런 얘긴 줄 몰랐어'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '작은 이야기에 큰 의미',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '우화가 더 진실해 / 그냥 동화잖아',
    },
    warning: {
      alert: '서점 그림책 코너에 서서 30분째 울컥하는 중',
      sideEffect: '예능 보다가도 인생 교훈을 뽑아냄',
    },
    books: [
      { emoji: '🦊', genre: '어른을 위한 동화', note: '어릴 때 읽었던 그 책, 다시' },
      { emoji: '🖼️', genre: '그림책', note: '글 몇 줄에 마음이 무너짐' },
      { emoji: '🐢', genre: '우화집', note: '짧은데 오래 남는 이야기' },
      { emoji: '🌸', genre: '짧은 소설집', note: '출근길에 한 편씩' },
      { emoji: '🌳', genre: '자연 에세이', note: '나무 한 그루에서 인생을 배움' },
      { emoji: '🧸', genre: '성장 동화', note: '어른이 돼서 읽으니 더 아픔' },
    ],
  },

  TIER: {
    code: 'TIER',
    name: '읽고 까먹는 다독러',
    emoji: '🏃',
    rarityText: '전체의 2.3% · 최희귀 등급',
    rarityLevel: 'ultra-rare',
    rarityPct: 2.3,
    tagline: '빠르게 읽고 빠르게 잊는 속독 머신.',
    description: '빠르게 읽고 다음 책으로 넘어가는 속독형 독서 성향이에요. 책을 읽을 때 속도감 있게 전개되는 이야기를 좋아하고, 한번 잡으면 그 자리에서 끝까지 달려요. 읽은 권수가 쌓이는 게 뿌듯하지만, 가끔 내용이 기억 안 나서 같은 책을 또 사기도 해요.',
    accent: '#ef4444',
    habitatColors: { h1: '#1a0606', h2: '#2a0a0a' },
    particle: 'spark',
    baseStats: { 몰입력: 78, 인내심: 70, 감수성: 33, 허세력: 62, 완독력: 92 },
    thoughts: ['이번 달 몇 권 읽었더라', '다 읽었다, 다음 책 뭐 읽지', '어? 이거 읽었던 책인가?'],
    compatibility: {
      match: 'TIGR', matchEmoji: '⚔️', matchName: '지식 사냥꾼',
      matchLine: '우리 둘 다 빠르네',
      opposite: 'FCGR', oppEmoji: '🌙', oppName: '한 문장에 머무는 사람',
      oppLine: '좀 빨리 읽어 / 음미를 해야지',
    },
    warning: {
      alert: '줄거리 물어보면 슬쩍 눈을 피함',
      sideEffect: '책장에 같은 책이 두 권씩 꽂혀 있음',
    },
    books: [
      { emoji: '🔪', genre: '추리·스릴러', note: '범인 궁금해서 멈출 수가 없음' },
      { emoji: '🏎️', genre: '속도감 있는 장르소설', note: '페이지가 알아서 넘어감' },
      { emoji: '📰', genre: '화제의 신간', note: '요즘 다들 읽는 책은 일단 읽음' },
      { emoji: '⏱️', genre: '가벼운 실용서', note: '한 시간 컷 가능' },
      { emoji: '🎬', genre: '영상화 원작 소설', note: '드라마 나오기 전에 먼저 끝냄' },
      { emoji: '📦', genre: '얇은 단편집', note: '권수 채우기 최적' },
    ],
  },

  TIEW: {
    code: 'TIEW',
    name: '논리적으로 책을 분석하는 사람',
    emoji: '🚀',
    rarityText: '전체의 6.1% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.1,
    tagline: '딴 세계를 진지하게 분석하며 도망침.',
    description: '다른 세계를 논리로 파고드는 분석형 독서 성향이에요. 책을 읽을 때 탄탄한 설정과 복선이 맞아떨어지는 순간을 좋아하고, 세계관의 규칙을 하나하나 따져보며 몰입해요. 이야기에 푹 빠져 있으면서도 머릿속으론 계속 검증 중이라, 설정 구멍을 발견하면 그냥 넘어가지 못해요.',
    accent: '#2dd4bf',
    habitatColors: { h1: '#061a1a', h2: '#0a2828' },
    particle: 'star',
    baseStats: { 몰입력: 90, 인내심: 76, 감수성: 45, 허세력: 60, 완독력: 85 },
    thoughts: ['이거 과학적으로 가능한가?', '아까 그 장면 복선이었네', '이 설정이면 앞뒤가 안 맞는데'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '세계관 토론하자',
      opposite: 'FCER', oppEmoji: '🍵', oppName: '마음을 데우는 사람',
      oppLine: '설정이 핵심 / 분위기가 핵심인데',
    },
    warning: {
      alert: '설정 구멍 발견하면 리뷰가 논문이 됨',
      sideEffect: '영화 보면서 "원작이랑 다른데" 중얼거림',
    },
    books: [
      { emoji: '🚀', genre: '하드 SF', note: '과학 설정이 탄탄할수록 좋아' },
      { emoji: '🧩', genre: '복선 가득한 미스터리', note: '마지막에 퍼즐 맞추는 맛' },
      { emoji: '🤖', genre: '디스토피아 소설', note: '이 사회 어떻게 굴러가는지 궁금' },
      { emoji: '🌀', genre: '타임루프 소설', note: '타임라인 직접 그려가며 읽음' },
      { emoji: '🗺️', genre: '설정집 있는 판타지', note: '본편보다 설정집이 더 재밌음' },
      { emoji: '👾', genre: '게임 세계관 소설', note: '룰이 명확한 세계가 편함' },
    ],
  },

  TIGR: {
    code: 'TIGR',
    name: '책 속의 지식을 찾는 지식 사냥꾼',
    emoji: '⚔️',
    rarityText: '전체의 4.8% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 4.8,
    tagline: '책장은 가득, 완독률은 글쎄. 사는 게 곧 읽는 거 아님?',
    description: '책에서 쓸모 있는 지식을 사냥하는 탐구형 독서 성향이에요. 책을 읽을 때 새로운 정보와 인사이트를 얻는 걸 좋아하고, 필요한 부분만 골라 빠르게 흡수해요. 궁금한 주제가 생기면 관련 책부터 사들이는데, 읽는 속도가 사는 속도를 못 따라가서 책장이 늘 꽉 차 있어요.',
    accent: '#fbbf24',
    habitatColors: { h1: '#1f1608', h2: '#2b1f0c' },
    particle: 'ember',
    baseStats: { 몰입력: 74, 인내심: 58, 감수성: 36, 허세력: 80, 완독력: 48 },
    thoughts: ['이거 나중에 꼭 써먹어야지', '이 분야 책 몇 권 더 사볼까', '목차 보고 필요한 데만 읽자'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '지식 동지',
      opposite: 'FIEW', oppEmoji: '🤿', oppName: '프로 잠수부',
      oppLine: '소설은 시간낭비 / 정 없다 진짜',
    },
    warning: {
      alert: '서점 들어가면 빈손으로 못 나옴',
      sideEffect: '안 읽은 책 탑이 책상 높이를 넘어섬',
    },
    books: [
      { emoji: '📈', genre: '경제·경영서', note: '읽으면 부자 될 것 같은 기분' },
      { emoji: '🧠', genre: '교양 과학서', note: '아는 척하기 좋은 지식' },
      { emoji: '🏛️', genre: '역사 교양서', note: '세상이 왜 이렇게 됐는지' },
      { emoji: '🛠️', genre: '자기계발서', note: '읽는 순간만큼은 갓생' },
      { emoji: '💻', genre: '트렌드 분석서', note: '내년에 뭐가 뜰지 미리' },
      { emoji: '📊', genre: '심리학 교양서', note: '사람 행동에도 공식이 있다' },
    ],
  },

  TIGW: {
    code: 'TIGW',
    name: '가능성을 설계하는 사람',
    emoji: '🛠️',
    rarityText: '전체의 8.9% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 8.9,
    tagline: '상상의 세계를 진지하게 설계하고 배움.',
    description: '상상을 설계도로 바꾸는 창작형 독서 성향이에요. 책을 읽을 때 새로운 아이디어와 미래에 대한 상상을 좋아하고, 읽다가 영감이 오면 바로 메모부터 해요. 이야기 속 세계를 그냥 즐기기보다 "이걸 현실로 만들면?"을 먼저 떠올려서, 책 한 권이 프로젝트 하나로 이어지기도 해요.',
    accent: '#fb923c',
    habitatColors: { h1: '#1a0e04', h2: '#261608' },
    particle: 'spark',
    baseStats: { 몰입력: 86, 인내심: 73, 감수성: 52, 허세력: 64, 완독력: 76 },
    thoughts: ['이걸로 뭔가 만들 수 있겠는데', '잠깐, 메모장 어디 있지', '10년 뒤엔 진짜 이렇게 되지 않을까'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '같이 세계 만들자',
      opposite: 'FCER', oppEmoji: '🍵', oppName: '마음을 데우는 사람',
      oppLine: '이게 미래야 / 그냥 좀 쉬어...',
    },
    warning: {
      alert: '책 읽다가 갑자기 노트북 열고 기획서 씀',
      sideEffect: '메모장에 시작만 한 아이디어가 50개',
    },
    books: [
      { emoji: '🔮', genre: '미래 예측서', note: '10년 뒤를 미리 훔쳐봄' },
      { emoji: '🚀', genre: '아이디어 SF', note: '읽다가 사업 아이템 떠오름' },
      { emoji: '🏗️', genre: '창업·혁신 이야기', note: '만든 사람들의 뒷이야기' },
      { emoji: '🎨', genre: '크리에이티브 에세이', note: '영감은 어디서 오는가' },
      { emoji: '🧪', genre: '과학기술 교양서', note: '곧 현실이 될 기술들' },
      { emoji: '🌍', genre: '세계관 창작 가이드', note: '나만의 세계 설계하기' },
    ],
  },

  TCER: {
    code: 'TCER',
    name: '거리를 두고 관찰하는 사람',
    emoji: '🔭',
    rarityText: '전체의 2.3% · 최희귀 등급',
    rarityLevel: 'ultra-rare',
    rarityPct: 2.3,
    tagline: '세상과 한 발 떨어져 조용히 관찰함.',
    description: '한 발 떨어져서 세상을 바라보는 관찰형 독서 성향이에요. 책을 읽을 때 인물의 감정에 휩쓸리기보다 그 사람이 왜 그렇게 행동하는지 살펴보는 걸 좋아해요. 조용히 사색하며 읽는 시간이 곧 쉼이고, 과한 감동 코드보다 담담하게 사람을 그리는 이야기에 오래 머물러요.',
    accent: '#38bdf8',
    habitatColors: { h1: '#061422', h2: '#0a1e30' },
    particle: 'mote',
    baseStats: { 몰입력: 62, 인내심: 88, 감수성: 42, 허세력: 55, 완독력: 72 },
    thoughts: ['이 사람 왜 이런 선택을 했을까', '신파 코드는 좀 부담스러운데', '결국 사람 사는 건 다 비슷하네'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '냉정한 동지',
      opposite: 'FIER', oppEmoji: '🏊', oppName: '심해 표류자',
      oppLine: '객관적으로 봐 / 공감 좀 해줘',
    },
    warning: {
      alert: '다들 우는 장면에서 혼자 표정 변화 없음',
      sideEffect: '친구 고민 들으면서 등장인물 분석하듯 말함',
    },
    books: [
      { emoji: '🔭', genre: '사회 관찰 에세이', note: '요즘 사람들은 왜 이럴까' },
      { emoji: '🏙️', genre: '도시 소설', note: '담담하게 그린 보통 사람들' },
      { emoji: '🧊', genre: '건조한 문체의 소설', note: '감정 과잉 없는 이야기' },
      { emoji: '🔍', genre: '심리학 교양서', note: '사람 속을 들여다보는 법' },
      { emoji: '📰', genre: '르포·논픽션', note: '현실이 소설보다 더 소설 같음' },
      { emoji: '🕰️', genre: '고전 문학', note: '시대가 달라도 사람은 같음' },
    ],
  },

  TCEW: {
    code: 'TCEW',
    name: '머릿속에 나만의 우주를 건설하는 사람',
    emoji: '🌌',
    rarityText: '전체의 6.1% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.1,
    tagline: '책 한 권으로 머릿속에 우주 하나 건설함.',
    description: '한 권의 책에서 생각의 우주를 넓히는 사색형 독서 성향이에요. 책을 읽을 때 거대한 질문이나 철학적인 주제를 좋아하고, 다 읽고 나서도 며칠씩 그 생각을 붙잡고 있어요. 책이 던진 아이디어를 머릿속에서 계속 확장하다 보니, 읽는 시간보다 생각하는 시간이 더 길어요.',
    accent: '#818cf8',
    habitatColors: { h1: '#0c0c22', h2: '#121230' },
    particle: 'star',
    baseStats: { 몰입력: 84, 인내심: 91, 감수성: 64, 허세력: 66, 완독력: 67 },
    thoughts: ['우리 세계도 시뮬레이션이면?', '책 덮고 천장 좀 봐야겠다', '이 개념을 다른 데 적용하면...'],
    compatibility: {
      match: 'TIGW', matchEmoji: '🛠️', matchName: '가능성을 설계하는 사람',
      matchLine: '우주 공동 건설',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '곱씹어야지 / 다음 책 가자',
    },
    warning: {
      alert: '책 덮고 천장 보다가 3시간 순삭',
      sideEffect: '점심 메뉴 고르다가 자유의지 얘기로 샘',
    },
    books: [
      { emoji: '🌌', genre: '철학적인 SF', note: '읽고 나면 존재가 흔들림' },
      { emoji: '🧠', genre: '철학 입문서', note: '질문이 더 많아지는 책' },
      { emoji: '🪐', genre: '우주 과학 교양서', note: '나는 먼지만큼 작구나' },
      { emoji: '♾️', genre: '사고실험 책', note: '"만약에"를 끝까지 밀어붙임' },
      { emoji: '🏛️', genre: '고전 사상서', note: '천 년 전 사람과 대화하기' },
      { emoji: '🌀', genre: '난해한 문학', note: '해설 찾아보는 게 국룰' },
    ],
  },

  TCGR: {
    code: 'TCGR',
    name: '세상을 날카롭게 해부하는 사람',
    emoji: '🔬',
    rarityText: '전체의 4.8% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 4.8,
    tagline: '재밌게 읽다가 결국 다 분석함. 작가 의도까지 부검 완료.',
    description: '읽은 것을 끝까지 파고드는 비판형 독서 성향이에요. 책을 읽을 때 작가의 의도와 논리 구조를 따져보는 걸 좋아하고, 재밌게 읽다가도 결국엔 분석하고 있어요. 동의하는 부분과 반박할 부분을 나눠 정리해야 제대로 읽은 것 같고, 누군가와 토론할 때 가장 신나요.',
    accent: '#a3e635',
    habitatColors: { h1: '#0e1a0c', h2: '#16240f' },
    particle: 'cross',
    baseStats: { 몰입력: 75, 인내심: 89, 감수성: 50, 허세력: 63, 완독력: 82 },
    thoughts: ['작가가 진짜 하고 싶은 말은 이거네', '근데 이 논리 좀 약한데', '이거 누구랑 토론하고 싶다'],
    compatibility: {
      match: 'FIEW', matchEmoji: '🤿', matchName: '프로 잠수부',
      matchLine: '너가 분석하면 내가 울어줄게',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '생각하면서 읽어 / 피곤하게 왜 그래',
    },
    warning: {
      alert: '베스트셀러 추천하면 반박 세 개부터 나옴',
      sideEffect: '드라마 같이 보는 사람이 해설 듣다 지침',
    },
    books: [
      { emoji: '🔬', genre: '인문 사회 비평서', note: '당연한 걸 의심하는 책' },
      { emoji: '⚖️', genre: '논쟁적인 논픽션', note: '반박하면서 읽는 재미' },
      { emoji: '📋', genre: '고전 명저', note: '다들 인용만 하는 그 책' },
      { emoji: '🗳️', genre: '정치·사회 분석서', note: '뉴스 뒤에 숨은 구조' },
      { emoji: '🕵️', genre: '사회파 미스터리', note: '범인보다 사회가 문제' },
      { emoji: '💬', genre: '토론 모임 단골 책', note: '의견 갈릴수록 좋은 책' },
    ],
  },

  TCGW: {
    code: 'TCGW',
    name: '질문만 수백 개 던지는 사람',
    emoji: '❓',
    rarityText: '전체의 8.9% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 8.9,
    tagline: '결말 보고 더 헷갈림. 작가한테 따지고 싶은 게 한가득.',
    description: '답보다 질문을 모으는 탐문형 독서 성향이에요. 책을 읽을 때 명쾌한 결말보다 여러 해석이 가능한 이야기를 좋아하고, 한 장면에서도 "왜?"를 끝없이 떠올려요. 책을 덮고 해석을 찾아보는 게 독서의 2부이고, 질문이 많이 남는 책일수록 좋은 책이라고 생각해요.',
    accent: '#e879f9',
    habitatColors: { h1: '#1a0820', h2: '#24102e' },
    particle: 'question',
    baseStats: { 몰입력: 77, 인내심: 86, 감수성: 60, 허세력: 58, 완독력: 74 },
    thoughts: ['근데 왜 그랬을까?', '이 결말 해석이 몇 개야', '작가님한테 DM 보내고 싶다'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '끝없이 토론 가능',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '질문이 안 생겨? / 그냥 읽으면 되지',
    },
    warning: {
      alert: '독서모임에서 "근데 왜요?"로 두 시간 끔',
      sideEffect: '책 한 권 읽고 해석 영상만 열 개 봄',
    },
    books: [
      { emoji: '❓', genre: '열린 결말 소설', note: '끝나도 끝난 게 아님' },
      { emoji: '🌀', genre: '해석이 갈리는 문학', note: '읽을 때마다 다른 이야기' },
      { emoji: '🧩', genre: '철학 동화', note: '쉬운 말로 어려운 질문' },
      { emoji: '🔮', genre: '미스터리 판타지', note: '떡밥은 많고 답은 적음' },
      { emoji: '🪞', genre: '우화 소설', note: '이 동물은 사실 누구일까' },
      { emoji: '💭', genre: '질문하는 교양서', note: '정답 대신 생각거리를 줌' },
    ],
  },
}

export const TYPE_CODES = Object.keys(READING_TYPES) as TypeCode[]

// 디자인 시스템 뱃지는 common/rare/epic 3단계만 지원 → 5단계 희소도를 매핑
export type RarityBadgeVariant = 'common' | 'rare' | 'epic'

export function rarityBadgeVariant(level: RarityLevel): RarityBadgeVariant {
  if (level === 'most-common' || level === 'common') return 'common'
  if (level === 'rare') return 'rare'
  return 'epic' // very-rare, ultra-rare
}

export const RARITY_BADGE_LABELS: Record<RarityBadgeVariant, string> = {
  common: '흔함',
  rare: '희귀',
  epic: '최희귀',
}
