// Phase 2 — 블라인드 책 카드 데이터
// 실서비스에서는 서버에서 내려오는 데이터. 현재는 샘플 5권 고정.

export interface BlindBookDescSegment {
  text: string
  emphasis?: boolean
}

export interface BlindBookTag {
  text: string
  kind: 'primary' | 'mood' | 'genre'
}

export interface BlindBookMeta {
  key: string
  value: string
}

export interface BlindBook {
  id: number
  illustCode: string // 공개 후 표지 일러스트 코드
  tags: BlindBookTag[]
  desc: BlindBookDescSegment[]
  meta: BlindBookMeta[]
  hints: [string, string, string]
  title: string
  author: string
  revealMsg: string
}

export const BLIND_BOOKS: BlindBook[] = [
  {
    id: 1,
    illustCode: 'blind-01',
    tags: [
      { text: '잔잔한 파국', kind: 'primary' },
      { text: '쓸쓸함', kind: 'mood' },
      { text: '성장소설', kind: 'genre' },
    ],
    desc: [
      { text: '한 사람이 ' },
      { text: '아무것도 하지 않기로 결심', emphasis: true },
      { text: '하는 이야기. 세상과 천천히 멀어지면서도, 이상하게 더 또렷해지는 것들에 대해 쓴 소설.' },
    ],
    meta: [
      { key: '분위기', value: '고요하고 서늘한' },
      { key: '길이', value: '짧음 (200p 내외)' },
      { key: '난이도', value: '보통' },
    ],
    hints: [
      '읽는 내내 아무 일도 안 일어나는데 다 읽고 나서 멍했어요',
      '문장이 자꾸 늘어져서 처음엔 지루했는데 어느 순간부터 못 놓겠더라고요',
      '이걸 좋아하는 사람도 있고 못 견디는 사람도 있을 것 같아요',
    ],
    title: '나의 투쟁',
    author: '칼 오베 크나우스고르',
    revealMsg: '삶의 일상을 극단적으로 밀어붙인 자전적 대하소설. 무료하지만 중독성 있는 "아무것도 안 하는 것의 폭력"을 담아냈습니다.',
  },
  {
    id: 2,
    illustCode: 'blind-02',
    tags: [
      { text: '심장이 달려감', kind: 'primary' },
      { text: '긴장·불안', kind: 'mood' },
      { text: '스릴러', kind: 'genre' },
    ],
    desc: [
      { text: '처음 두 페이지에서 ' },
      { text: '이미 누군가 죽는다.', emphasis: true },
      { text: ' 그리고 독자는 범인을 아는데 주인공만 모른다. 그 불편함이 끝까지 간다.' },
    ],
    meta: [
      { key: '분위기', value: '날카롭고 조여드는' },
      { key: '길이', value: '중간 (350p)' },
      { key: '난이도', value: '쉬움' },
    ],
    hints: [
      '지하철에서 읽다가 정류장 놓쳤어요',
      '마지막 장 덮고 처음부터 다시 읽었어요, 그제야 다 보이더라고요',
      '문장이 짧고 빨라서 하루 만에 다 읽었어요',
    ],
    title: '살인자의 기억법',
    author: '김영하',
    revealMsg: '치매에 걸린 전직 연쇄살인범이 화자인 서스펜스 소설. 기억이 흐릿해질수록 진실도 흐릿해지는 구조가 압권입니다.',
  },
  {
    id: 3,
    illustCode: 'blind-03',
    tags: [
      { text: '마음이 따뜻해짐', kind: 'primary' },
      { text: '위로', kind: 'mood' },
      { text: '에세이', kind: 'genre' },
    ],
    desc: [
      { text: '잘 하지 않아도 되는 것들', emphasis: true },
      { text: '에 대한 이야기. 완벽하지 않아도 괜찮다는 말을 이렇게 아름답게 쓸 수 있다는 걸 보여주는 책.' },
    ],
    meta: [
      { key: '분위기', value: '포근하고 느린' },
      { key: '길이', value: '짧음 (160p)' },
      { key: '난이도', value: '매우 쉬움' },
    ],
    hints: [
      '출퇴근 때 읽었는데 지하철에서 눈물 날 뻔했어요',
      '힘들 때마다 아무 페이지나 펴서 다시 읽어요',
      '문장이 너무 예뻐서 필사하고 싶은 구절이 많아요',
    ],
    title: '어떻게 살아야 할지 모르는 너에게',
    author: '강규형',
    revealMsg: '자기계발서도 아니고 힐링서도 아닌 묘한 위치의 에세이. "아무것도 안 해도 돼"라는 말을 가장 예쁘게 쓴 책이라는 평을 받았습니다.',
  },
  {
    id: 4,
    illustCode: 'blind-04',
    tags: [
      { text: '생각이 계속 남음', kind: 'primary' },
      { text: '도시·고독', kind: 'mood' },
      { text: '장편소설', kind: 'genre' },
    ],
    desc: [
      { text: '수천만 명이 사는 도시에서 ' },
      { text: '완전히 혼자인 사람', emphasis: true },
      { text: '의 이야기. 외로움이 감정이 아니라 구조적인 문제라는 걸 서서히 납득하게 만드는 소설.' },
    ],
    meta: [
      { key: '분위기', value: '쓸쓸하고 밀도 높은' },
      { key: '길이', value: '긴 편 (480p)' },
      { key: '난이도', value: '보통' },
    ],
    hints: [
      '다 읽고 나서 창밖을 오래 봤어요',
      '오래된 책인데 지금 얘기하는 것 같아서 놀랐어요',
      '조금 딱딱해서 완독하는 데 시간이 걸렸어요',
    ],
    title: '군중 속의 고독',
    author: '데이비드 리스먼',
    revealMsg: '1950년대에 쓰인 사회학 고전이지만 지금 읽으면 더 뜨끔한 책. "타인 지향형 인간"이라는 개념이 SNS 시대와 완벽하게 맞아떨어집니다.',
  },
  {
    id: 5,
    illustCode: 'blind-05',
    tags: [
      { text: '뇌가 꼬임', kind: 'primary' },
      { text: '기묘·철학', kind: 'mood' },
      { text: '단편집', kind: 'genre' },
    ],
    desc: [
      { text: '결말이 없는 이야기들의 모음집.', emphasis: true },
      { text: ' 모든 단편이 질문으로 끝나고, 독자가 그 질문을 받아서 스스로 결말을 쓰게 된다.' },
    ],
    meta: [
      { key: '분위기', value: '기묘하고 열린' },
      { key: '길이', value: '짧음 (180p)' },
      { key: '난이도', value: '보통' },
    ],
    hints: [
      '읽고 나서 친구한테 "이게 무슨 뜻인 것 같아?" 연속으로 물어봤어요',
      '한 편씩 나눠 읽으면서 매번 다른 결말을 상상해봤어요',
      '명확한 답을 좋아하는 사람은 답답할 수도 있어요',
    ],
    title: '열린 결말을 사랑한 사람들',
    author: '보르헤스 (재편집)',
    revealMsg: '보르헤스 스타일에서 영감을 받아 엮은 가상의 단편집. 답을 주지 않고 질문만 남기는 방식이 처음에는 불편하지만, 나중엔 그 불편함이 좋아집니다.',
  },
]

export const BLIND_REACTIONS = [
  { key: '울었음', label: '울 것 같아요' },
  { key: '몰입', label: '몰입할 것 같아요' },
  { key: '생각많아짐', label: '생각이 많아질 것 같아요' },
  { key: '재독의향', label: '두 번 읽을 것 같아요' },
] as const
