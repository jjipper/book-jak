export type TypeCode =
  | 'FIEW' | 'FIER' | 'FIGR' | 'FIGW'
  | 'FCER' | 'FCEW' | 'FCGR' | 'FCGW'
  | 'TIER' | 'TIEW' | 'TIGR' | 'TIGW'
  | 'TCER' | 'TCEW' | 'TCGR' | 'TCGW'

export type RarityLevel = 'most-common' | 'common' | 'rare' | 'very-rare' | 'ultra-rare'
export type ParticleType = 'bubble' | 'ember' | 'mote' | 'cross' | 'star' | 'leaf' | 'spark' | 'question'

export type StatKey = '몰입력' | '인내심' | '감수성' | '허세력' | '완독력'

export interface ReadingType {
  code: TypeCode
  name: string
  emoji: string
  rarityText: string
  rarityLevel: RarityLevel
  rarityPct: number
  tagline: string
  accent: string
  habitatColors: { h1: string; h2: string }
  particle: ParticleType
  baseStats: Record<StatKey, number>
  brain: { label: string; pct: number }[]
  quote: string[]
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
  titles: string[]
  warning: { alert: string; sideEffect: string }
  fortune: { text: string; prescription: string }
  prophecy: string
}

export const READING_TYPES: Record<TypeCode, ReadingType> = {
  FIEW: {
    code: 'FIEW',
    name: '프로 잠수부',
    emoji: '🤿',
    rarityText: '전체의 4.1% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 4.1,
    tagline: '책 펴는 순간 현실에서 잠수 탐. 호출 금지.',
    accent: '#2dd4bf',
    habitatColors: { h1: '#06222b', h2: '#0a3540' },
    particle: 'bubble',
    baseStats: { 몰입력: 94, 인내심: 22, 감수성: 96, 허세력: 40, 완독력: 61 },
    brain: [
      { label: '현실도피', pct: 36 },
      { label: '감정이입', pct: 28 },
      { label: '다음 권 결제', pct: 19 },
      { label: '밤샘 후회', pct: 12 },
      { label: '책 냄새 흡입', pct: 5 },
    ],
    quote: ['딱 한 챕터만 더...', '엔딩 보고 며칠 멍했음'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '너가 분석하면 내가 울어줄게',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '소설을 왜 읽냐고? 나가.',
    },
    titles: ['🥇 한 자리에서 완독 12회', '🔥 새벽 독서 연속 31일', '💸 안 읽을 거면서 산 책 컬렉터'],
    warning: {
      alert: '독서 중 말 걸면 영혼 이탈 가능',
      sideEffect: '새벽 3시 후회 + 통장 잔고 감소',
    },
    fortune: {
      text: '당신에게 필요한 건 휴식이 아니라 600페이지짜리 벽돌책입니다.',
      prescription: '이번 주, 쌓아둔 책 한 권만 끝내기 (제발)',
    },
    prophecy: '당신은 23권을 살 것이고, 그중 9권을 읽을 것입니다.',
  },

  FIER: {
    code: 'FIER',
    name: '심해 표류자',
    emoji: '🏊',
    rarityText: '전체의 7.3% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 7.3,
    tagline: '현실이 힘들 땐 남의 현실로 도망친다.',
    accent: '#f87171',
    habitatColors: { h1: '#1a0808', h2: '#2a1010' },
    particle: 'mote',
    baseStats: { 몰입력: 85, 인내심: 44, 감수성: 97, 허세력: 25, 완독력: 70 },
    brain: [
      { label: '위로받기', pct: 33 },
      { label: '감정대리', pct: 26 },
      { label: '현실회피', pct: 21 },
      { label: '공감 폭발', pct: 15 },
      { label: '한숨', pct: 5 },
    ],
    quote: ['이거 완전 내 얘기야', '위로받으려고 읽는 거지'],
    compatibility: {
      match: 'FCGR', matchEmoji: '🌙', matchName: '한 문장에 머무는 사람',
      matchLine: '같이 밑줄 긋자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '감동은 됐고 정보를 줘 / 정 없다 진짜',
    },
    titles: ['😭 에세이 눈물 컬렉터', '📖 위로책 재독왕', '☕ 카페 독서 단골'],
    warning: {
      alert: '슬픈 장면에서 공공장소 오열 주의',
      sideEffect: '책 한 권 읽고 인생 돌아보기 발작',
    },
    fortune: {
      text: '당신에게 필요한 건 또 다른 에세이가 아니라 햇빛입니다.',
      prescription: '이번 주는 슬픈 책 말고 웃긴 책 한 권',
    },
    prophecy: '당신은 에세이 18권을 읽고, 그중 14권에서 울 것입니다.',
  },

  FIGR: {
    code: 'FIGR',
    name: '이야기로 자라는 사람',
    emoji: '🌱',
    rarityText: '전체의 8.1% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 8.1,
    tagline: '울면서 읽었는데 어느새 더 나은 사람이 됨.',
    accent: '#4ade80',
    habitatColors: { h1: '#061a0c', h2: '#0c2812' },
    particle: 'leaf',
    baseStats: { 몰입력: 88, 인내심: 72, 감수성: 91, 허세력: 33, 완독력: 84 },
    brain: [
      { label: '감정성장', pct: 30 },
      { label: '몰입', pct: 27 },
      { label: '메모', pct: 22 },
      { label: '실천 다짐', pct: 16 },
      { label: '작가 사랑', pct: 5 },
    ],
    quote: ['이 책이 날 바꿨어', '인생책 또 갱신'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '너는 머리로, 나는 가슴으로',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '그렇게 빨리 읽으면 남는 게 있어?',
    },
    titles: ['🌟 인생책 보유 7권', '✍️ 독서노트 마스터', '🔁 감동 재독러'],
    warning: {
      alert: '책 추천받으면 거절 못 함',
      sideEffect: '읽고 나면 갑자기 인생 계획 수정',
    },
    fortune: {
      text: '올해 당신을 바꿀 책이 이미 책장에 꽂혀 있습니다.',
      prescription: '새 책 사기 전, 안 읽은 인생책 후보부터',
    },
    prophecy: '당신은 \'인생책\'을 5번 갱신할 것입니다.',
  },

  FIGW: {
    code: 'FIGW',
    name: '환상 속 나를 찾는 사람',
    emoji: '🦋',
    rarityText: '전체의 3.8% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 3.8,
    tagline: '판타지 속에서 진짜 나를 발견함.',
    accent: '#c084fc',
    habitatColors: { h1: '#160a26', h2: '#1e1030' },
    particle: 'star',
    baseStats: { 몰입력: 93, 인내심: 75, 감수성: 89, 허세력: 42, 완독력: 78 },
    brain: [
      { label: '자아투영', pct: 31 },
      { label: '세계관 흡수', pct: 25 },
      { label: '감정성장', pct: 20 },
      { label: '상상 폭주', pct: 19 },
      { label: '코스프레 충동', pct: 5 },
    ],
    quote: ['이 세계관 너무 좋아', '주인공이 나 같아'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '우리 세계관 합치자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '판타지는 도피야 / 도피가 어때서',
    },
    titles: ['🐉 세계관 박사', '🎨 2차 창작러', '📚 시리즈 정주행 마스터'],
    warning: {
      alert: '좋아하는 시리즈 완결 나면 금단현상',
      sideEffect: '현실 인물을 캐릭터로 분류하기 시작',
    },
    fortune: {
      text: '당신이 찾던 답은 다음 권에 있습니다. (시리즈물입니다)',
      prescription: '현실 친구랑 밥 한 끼 (제발)',
    },
    prophecy: '당신은 새 세계관 3개에 입덕할 것입니다.',
  },

  FCER: {
    code: 'FCER',
    name: '마음을 데우는 사람',
    emoji: '🍵',
    rarityText: '전체의 6.9% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.9,
    tagline: '빨리 안 읽어. 천천히 따뜻하게 스며들어.',
    accent: '#fb923c',
    habitatColors: { h1: '#1c0e06', h2: '#28160a' },
    particle: 'mote',
    baseStats: { 몰입력: 64, 인내심: 80, 감수성: 92, 허세력: 28, 완독력: 66 },
    brain: [
      { label: '잔잔함 추구', pct: 32 },
      { label: '음미', pct: 27 },
      { label: '힐링', pct: 21 },
      { label: '분위기', pct: 15 },
      { label: '멍', pct: 5 },
    ],
    quote: ['천천히 읽는 게 좋아', '이 분위기 너무 좋다'],
    compatibility: {
      match: 'FCGR', matchEmoji: '🌙', matchName: '한 문장에 머무는 사람',
      matchLine: '우리 진도 비슷하네',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '좀 천천히 읽어... / 시간 아까워',
    },
    titles: ['🕯️ 무드 독서 장인', '☕ 카페 정주 독서가', '🐢 느림보 완독러'],
    warning: {
      alert: '분위기 안 맞으면 책 안 펼침',
      sideEffect: '한 권을 한 달 동안 붙잡음',
    },
    fortune: {
      text: '속도를 내려 하지 마세요. 당신의 독서는 원래 느린 게 정상입니다.',
      prescription: '책 한 권, 차 한 잔, 그게 다',
    },
    prophecy: '당신은 12권을 읽고, 그 모든 페이지를 음미할 것입니다.',
  },

  FCEW: {
    code: 'FCEW',
    name: '여백에 잠기는 몽상가',
    emoji: '🌫️',
    rarityText: '전체의 3.2% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 3.2,
    tagline: '책 펴놓고 딴생각하다 우주여행 다녀옴.',
    accent: '#a78bfa',
    habitatColors: { h1: '#100c20', h2: '#18122e' },
    particle: 'star',
    baseStats: { 몰입력: 60, 인내심: 55, 감수성: 95, 허세력: 30, 완독력: 45 },
    brain: [
      { label: '딴생각', pct: 34 },
      { label: '분위기 흡수', pct: 24 },
      { label: '감성 충전', pct: 20 },
      { label: '페이지 안 넘김', pct: 17 },
      { label: '어디까지 읽었지?', pct: 5 },
    ],
    quote: ['방금 뭐 읽었더라?', '분위기가 다 했지'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '같이 멍때리자',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '핵심이 뭐야? / 핵심은 분위기지...',
    },
    titles: ['☁️ 페이지 표류자', '🎐 무드 수집가', '📖 영원한 책갈피 그 페이지'],
    warning: {
      alert: '같은 페이지 5번 읽는 거 정상임',
      sideEffect: '책보다 책 읽는 자기 모습에 취함',
    },
    fortune: {
      text: '오늘은 진도를 포기하고 그냥 분위기만 즐기세요.',
      prescription: '짧은 시집 한 권으로 갈아타기',
    },
    prophecy: '당신은 30권을 펼치고, 8권을 끝낼 것입니다.',
  },

  FCGR: {
    code: 'FCGR',
    name: '한 문장에 머무는 사람',
    emoji: '🌙',
    rarityText: '전체의 6.2% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 6.2,
    tagline: '같은 페이지 세 번 읽음. 진도 안 나가는 게 아니라 음미 중.',
    accent: '#f0a6c0',
    habitatColors: { h1: '#1a1426', h2: '#241932' },
    particle: 'mote',
    baseStats: { 몰입력: 72, 인내심: 90, 감수성: 94, 허세력: 35, 완독력: 68 },
    brain: [
      { label: '음미', pct: 30 },
      { label: '밑줄', pct: 27 },
      { label: '자기성찰', pct: 22 },
      { label: '필사', pct: 16 },
      { label: '한숨', pct: 5 },
    ],
    quote: ['이 문장 봐봐', '한 줄 읽고 30분 멍때림'],
    compatibility: {
      match: 'FIEW', matchEmoji: '🤿', matchName: '프로 잠수부',
      matchLine: '너는 빠지고 나는 머물고',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '음미를 해야지 / 그러다 한 권도 못 끝내',
    },
    titles: ['✍️ 필사 마스터', '🖍️ 밑줄 아티스트', '🐢 정독의 화신'],
    warning: {
      alert: '책 한 권 끝내는 데 두 달 걸림',
      sideEffect: '좋은 문장 발견 시 단체방에 공유 폭격',
    },
    fortune: {
      text: '당신의 느린 독서가 곧 깊은 독서입니다. 조급해 마세요.',
      prescription: '이번엔 밑줄 없이 한 권 읽어보기 (가능할까)',
    },
    prophecy: '당신은 9권을 읽고, 1,200개의 문장에 밑줄을 그을 것입니다.',
  },

  FCGW: {
    code: 'FCGW',
    name: '우화에서 진심을 줍는 사람',
    emoji: '🦊',
    rarityText: '전체의 2.9% · 매우 희귀',
    rarityLevel: 'very-rare',
    rarityPct: 2.9,
    tagline: '동화책에도 우는 어른. 감수성 풀충전 상태.',
    accent: '#f97316',
    habitatColors: { h1: '#1a0c06', h2: '#26120a' },
    particle: 'leaf',
    baseStats: { 몰입력: 76, 인내심: 82, 감수성: 99, 허세력: 24, 완독력: 80 },
    brain: [
      { label: '은유 해석', pct: 31 },
      { label: '감동', pct: 26 },
      { label: '성찰', pct: 21 },
      { label: '따뜻함', pct: 17 },
      { label: '부끄러움', pct: 5 },
    ],
    quote: ['동화가 제일 잔인해', '이거 사실 어른 책 아니야?'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '작은 이야기에 큰 의미',
      opposite: 'TIGR', oppEmoji: '⚔️', oppName: '지식 사냥꾼',
      oppLine: '우화가 더 진실해 / 그냥 동화잖아',
    },
    titles: ['🦊 어린왕자 재독 9회', '🌸 우화 수집가', '💧 동화 눈물러'],
    warning: {
      alert: '그림책 코너에서 오래 머묾',
      sideEffect: '모든 이야기에서 인생 교훈 추출',
    },
    fortune: {
      text: '가장 얇은 책이 올해 당신을 가장 크게 울릴 것입니다.',
      prescription: '어릴 때 좋아한 동화 다시 읽기',
    },
    prophecy: '당신은 우화 한 편을 읽고, 일주일을 곱씹을 것입니다.',
  },

  TIER: {
    code: 'TIER',
    name: '읽고 까먹는 다독러',
    emoji: '🏃',
    rarityText: '전체의 7.8% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 7.8,
    tagline: '빠르게 읽고 빠르게 잊는 속독 머신.',
    accent: '#ef4444',
    habitatColors: { h1: '#1a0606', h2: '#2a0a0a' },
    particle: 'spark',
    baseStats: { 몰입력: 78, 인내심: 70, 감수성: 33, 허세력: 62, 완독력: 92 },
    brain: [
      { label: '다음 책', pct: 33 },
      { label: '속독', pct: 28 },
      { label: '정보 흡수', pct: 20 },
      { label: '권수 채우기', pct: 14 },
      { label: '어? 이거 읽었던가?', pct: 5 },
    ],
    quote: ['올해 벌써 40권', '내용은 기억 안 나는데 읽긴 읽었어'],
    compatibility: {
      match: 'TIGR', matchEmoji: '⚔️', matchName: '지식 사냥꾼',
      matchLine: '우리 둘 다 빠르네',
      opposite: 'FCGR', oppEmoji: '🌙', oppName: '한 문장에 머무는 사람',
      oppLine: '좀 빨리 읽어 / 음미를 해야지',
    },
    titles: ['📚 연간 50권 클럽', '⚡ 속독 스프린터', '🔢 권수 카운터'],
    warning: {
      alert: '읽은 책 또 사는 경우 빈번',
      sideEffect: '줄거리 물어보면 식은땀',
    },
    fortune: {
      text: '올해는 권수보다 한 권을 제대로 기억해보세요.',
      prescription: '이번 책은 천천히, 메모하면서',
    },
    prophecy: '당신은 52권을 읽고, 그중 12권의 제목을 기억할 것입니다.',
  },

  TIEW: {
    code: 'TIEW',
    name: '논리적으로 떠나는 사람',
    emoji: '🚀',
    rarityText: '전체의 3.5% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 3.5,
    tagline: '딴 세계를 진지하게 분석하며 도망침.',
    accent: '#2dd4bf',
    habitatColors: { h1: '#061a1a', h2: '#0a2828' },
    particle: 'star',
    baseStats: { 몰입력: 90, 인내심: 76, 감수성: 45, 허세력: 60, 완독력: 85 },
    brain: [
      { label: '설정 분석', pct: 30 },
      { label: '몰입', pct: 26 },
      { label: '현실도피', pct: 22 },
      { label: '떡밥 회수 추적', pct: 17 },
      { label: '이거 과학적으로 가능한가?', pct: 5 },
    ],
    quote: ['이 세계관 설정 탄탄하다', '복선 회수 미쳤다'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '세계관 토론하자',
      opposite: 'FCER', oppEmoji: '🍵', oppName: '마음을 데우는 사람',
      oppLine: '설정이 핵심 / 분위기가 핵심인데',
    },
    titles: ['🛸 SF 마스터', '🧩 복선 추적자', '📐 세계관 분석가'],
    warning: {
      alert: '설정 오류 발견 시 별점 테러',
      sideEffect: '영화 보면서 "원작이랑 다른데" 시전',
    },
    fortune: {
      text: '올해는 논리를 잠시 끄고 그냥 즐겨보세요. (어렵겠지만)',
      prescription: '설정 따지지 말고 한 권 읽기',
    },
    prophecy: '당신은 SF 신작 3편의 설정 오류를 발견할 것입니다.',
  },

  TIGR: {
    code: 'TIGR',
    name: '지식 사냥꾼',
    emoji: '⚔️',
    rarityText: '전체의 9.4% · 가장 흔함',
    rarityLevel: 'most-common',
    rarityPct: 9.4,
    tagline: '책장은 가득, 완독률은 글쎄. 사는 게 곧 읽는 거 아님?',
    accent: '#fbbf24',
    habitatColors: { h1: '#1f1608', h2: '#2b1f0c' },
    particle: 'ember',
    baseStats: { 몰입력: 74, 인내심: 58, 감수성: 36, 허세력: 80, 완독력: 48 },
    brain: [
      { label: '정보욕', pct: 32 },
      { label: '일단 구매', pct: 27 },
      { label: '발췌독', pct: 21 },
      { label: '자기계발', pct: 15 },
      { label: '죄책감', pct: 5 },
    ],
    quote: ['이거 꼭 읽어야 해', '사놓으면 언젠간 읽겠지'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '지식 동지',
      opposite: 'FIEW', oppEmoji: '🤿', oppName: '프로 잠수부',
      oppLine: '소설은 시간낭비 / 정 없다 진짜',
    },
    titles: ['📦 안 읽고 산 책 컬렉터', '🎯 발췌독 장인', '📚 책장 부자'],
    warning: {
      alert: '서점 가면 빈손으로 못 나옴',
      sideEffect: '\'쌓아둔 책\' 죄책감 만성화',
    },
    fortune: {
      text: '올해는 사는 것보다 끝내는 것에 집중하세요.',
      prescription: '새 책 한 권 살 때마다 헌 책 한 권 완독',
    },
    prophecy: '당신은 38권을 사고, 그중 11권을 읽을 것입니다.',
  },

  TIGW: {
    code: 'TIGW',
    name: '가능성을 설계하는 사람',
    emoji: '🛠️',
    rarityText: '전체의 2.6% · 매우 희귀',
    rarityLevel: 'very-rare',
    rarityPct: 2.6,
    tagline: '상상의 세계를 진지하게 설계하고 배움.',
    accent: '#fb923c',
    habitatColors: { h1: '#1a0e04', h2: '#261608' },
    particle: 'spark',
    baseStats: { 몰입력: 86, 인내심: 73, 감수성: 52, 허세력: 64, 완독력: 76 },
    brain: [
      { label: '아이디어 채굴', pct: 31 },
      { label: '세계관 구축', pct: 25 },
      { label: '미래 상상', pct: 22 },
      { label: '메모 폭주', pct: 17 },
      { label: '창업 충동', pct: 5 },
    ],
    quote: ['이거 영감 미쳤다', '이걸로 뭔가 만들 수 있겠는데'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '같이 세계 만들자',
      opposite: 'FCER', oppEmoji: '🍵', oppName: '마음을 데우는 사람',
      oppLine: '이게 미래야 / 그냥 좀 쉬어...',
    },
    titles: ['💡 아이디어 채굴러', '🏗️ 세계관 빌더', '📓 메모 마스터'],
    warning: {
      alert: '책 읽다 갑자기 노트북 열기',
      sideEffect: '모든 SF를 사업 아이템으로 변환',
    },
    fortune: {
      text: '올해 읽은 책 한 권이 당신의 프로젝트가 될 것입니다.',
      prescription: '영감만 받지 말고 한 개라도 실행하기',
    },
    prophecy: '당신은 아이디어 노트 3권을 채울 것입니다.',
  },

  TCER: {
    code: 'TCER',
    name: '거리를 두고 관찰하는 사람',
    emoji: '🔭',
    rarityText: '전체의 4.4% · 희귀 등급',
    rarityLevel: 'rare',
    rarityPct: 4.4,
    tagline: '세상과 한 발 떨어져 조용히 관찰함.',
    accent: '#38bdf8',
    habitatColors: { h1: '#061422', h2: '#0a1e30' },
    particle: 'mote',
    baseStats: { 몰입력: 62, 인내심: 88, 감수성: 42, 허세력: 55, 완독력: 72 },
    brain: [
      { label: '관조', pct: 30 },
      { label: '사색', pct: 26 },
      { label: '거리두기', pct: 22 },
      { label: '분석', pct: 17 },
      { label: '시니컬', pct: 5 },
    ],
    quote: ['흥미로운 관점이네', '감정적으로 안 읽혀'],
    compatibility: {
      match: 'TCGR', matchEmoji: '🔬', matchName: '세상을 해부하는 사람',
      matchLine: '냉정한 동지',
      opposite: 'FIER', oppEmoji: '🏊', oppName: '심해 표류자',
      oppLine: '객관적으로 봐 / 공감 좀 해줘',
    },
    titles: ['🔍 인간 관찰자', '🧊 냉정 독서가', '📝 사색 노트러'],
    warning: {
      alert: '신파 전개에 정색함',
      sideEffect: '등장인물을 표본처럼 분석',
    },
    fortune: {
      text: '올해는 분석을 멈추고 한 번쯤 감정에 빠져보세요.',
      prescription: '일부러 신파 소설 한 권 읽기',
    },
    prophecy: '당신은 인간 군상을 16번 관찰하고 기록할 것입니다.',
  },

  TCEW: {
    code: 'TCEW',
    name: '머릿속에 우주를 짓는 사람',
    emoji: '🌌',
    rarityText: '전체의 2.3% · 최희귀 등급',
    rarityLevel: 'ultra-rare',
    rarityPct: 2.3,
    tagline: '책 한 권으로 머릿속에 우주 하나 건설함.',
    accent: '#818cf8',
    habitatColors: { h1: '#0c0c22', h2: '#121230' },
    particle: 'star',
    baseStats: { 몰입력: 84, 인내심: 91, 감수성: 64, 허세력: 66, 완독력: 67 },
    brain: [
      { label: '사고확장', pct: 32 },
      { label: '상상', pct: 25 },
      { label: '철학', pct: 21 },
      { label: '몰입형 사색', pct: 17 },
      { label: '현실로 돌아와야 하는데', pct: 5 },
    ],
    quote: ['이거 읽고 며칠 생각했어', '세계관이 머릿속에 살아'],
    compatibility: {
      match: 'TIGW', matchEmoji: '🛠️', matchName: '가능성을 설계하는 사람',
      matchLine: '우주 공동 건설',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '곱씹어야지 / 다음 책 가자',
    },
    titles: ['🪐 사고실험 마스터', '🧠 철학 잠수부', '♾️ 무한 사색가'],
    warning: {
      alert: '책 덮고 천장 보며 3시간',
      sideEffect: '일상 대화에 형이상학 끼얹음',
    },
    fortune: {
      text: '올해 한 권이 당신의 세계관을 통째로 흔들 것입니다.',
      prescription: '생각만 말고 가끔은 글로 남기기',
    },
    prophecy: '당신은 7권을 읽고, 그중 3권으로 인생관을 재구성할 것입니다.',
  },

  TCGR: {
    code: 'TCGR',
    name: '세상을 해부하는 사람',
    emoji: '🔬',
    rarityText: '전체의 5.7% · 흔한 편',
    rarityLevel: 'common',
    rarityPct: 5.7,
    tagline: '재밌게 읽다가 결국 다 분석함. 작가 의도까지 부검 완료.',
    accent: '#a3e635',
    habitatColors: { h1: '#0e1a0c', h2: '#16240f' },
    particle: 'cross',
    baseStats: { 몰입력: 75, 인내심: 89, 감수성: 50, 허세력: 63, 완독력: 82 },
    brain: [
      { label: '분석', pct: 31 },
      { label: '비판적 읽기', pct: 27 },
      { label: '성장', pct: 21 },
      { label: '메모', pct: 16 },
      { label: '토론 욕구', pct: 5 },
    ],
    quote: ['작가가 진짜 하고 싶은 말은', '근데 이 논리 좀 약한데'],
    compatibility: {
      match: 'FIEW', matchEmoji: '🤿', matchName: '프로 잠수부',
      matchLine: '너가 분석하면 내가 울어줄게',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '생각하면서 읽어 / 피곤하게 왜 그래',
    },
    titles: ['🧠 비판적 독서가', '📋 논점 정리왕', '💬 독서토론 단골'],
    warning: {
      alert: '베스트셀러에 의외로 박함',
      sideEffect: '영화·드라마도 다 분석해버림',
    },
    fortune: {
      text: '올해는 분석 없이 그냥 재밌게 한 권 읽어보세요.',
      prescription: '가벼운 책 한 권, 메모 금지',
    },
    prophecy: '당신은 책 20권을 읽고, 그중 절반에 반박할 것입니다.',
  },

  TCGW: {
    code: 'TCGW',
    name: '질문만 수백 개 던지는 사람',
    emoji: '❓',
    rarityText: '전체의 2.1% · 최희귀 등급',
    rarityLevel: 'ultra-rare',
    rarityPct: 2.1,
    tagline: '결말 보고 더 헷갈림. 작가한테 따지고 싶은 게 한가득.',
    accent: '#e879f9',
    habitatColors: { h1: '#1a0820', h2: '#24102e' },
    particle: 'question',
    baseStats: { 몰입력: 77, 인내심: 86, 감수성: 60, 허세력: 58, 완독력: 74 },
    brain: [
      { label: '질문 생성', pct: 33 },
      { label: '가정', pct: 25 },
      { label: '사고확장', pct: 20 },
      { label: '토론 욕구', pct: 17 },
      { label: '작가님 어디 계세요', pct: 5 },
    ],
    quote: ['근데 왜 그랬을까?', '이 결말 해석 여러 갠데'],
    compatibility: {
      match: 'TCEW', matchEmoji: '🌌', matchName: '머릿속에 우주를 짓는 사람',
      matchLine: '끝없이 토론 가능',
      opposite: 'TIER', oppEmoji: '🏃', oppName: '읽고 까먹는 다독러',
      oppLine: '질문이 안 생겨? / 그냥 읽으면 되지',
    },
    titles: ['❓ 질문 제조기', '🗯️ 토론 개시자', '🔓 열린 결말 애호가'],
    warning: {
      alert: '독서모임에서 토론 끝낼 줄 모름',
      sideEffect: '명쾌한 결말에 오히려 실망',
    },
    fortune: {
      text: '올해 당신을 가장 괴롭힐 책은 답을 주지 않는 책입니다. (그래서 최고)',
      prescription: '답 없는 질문 하나, 일주일 품어보기',
    },
    prophecy: '당신은 15권을 읽고, 1,000개의 질문을 남길 것입니다.',
  },
}

export const TYPE_CODES = Object.keys(READING_TYPES) as TypeCode[]

// 희소도별 라벨
export const RARITY_LABELS: Record<RarityLevel, string> = {
  'most-common': '가장 흔함',
  'common': '흔한 편',
  'rare': '희귀 등급',
  'very-rare': '매우 희귀',
  'ultra-rare': '최희귀 등급',
}

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
