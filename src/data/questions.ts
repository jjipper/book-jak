// 4축: F/T, I/C, E/G, R/W
type AxisFT = 'F' | 'T'
type AxisIC = 'I' | 'C'
type AxisEG = 'E' | 'G'
type AxisRW = 'R' | 'W'
export type AxisValue = AxisFT | AxisIC | AxisEG | AxisRW

interface QuestionOption {
  id: string           // 'A' | 'B' | 'C' | 'D'
  label: string
  value: AxisValue
  badgeKey?: string    // 4지선다 C·D용 배지 후보
}

export interface Question {
  id: number           // 1~12
  axis: 'FT' | 'IC' | 'EG' | 'RW'
  type: 'binary' | 'quad'
  text: string
  subText?: string     // 보조 설명
  options: QuestionOption[]
}

export const QUESTIONS: Question[] = [
  // ── 축1: F/T (감정형 / 사유형) ── Q1·Q2·Q3 모두 2지선다
  {
    id: 1,
    axis: 'FT',
    type: 'binary',
    text: '책을 읽을 때 나는 주로…',
    options: [
      { id: 'A', label: '등장인물 감정에 같이 흔들린다\n"주인공이 울면 나도 운다"', value: 'F' },
      { id: 'B', label: '상황을 논리적으로 뜯어본다\n"이 장면, 왜 이렇게 전개됐지?"', value: 'T' },
    ],
  },
  {
    id: 2,
    axis: 'FT',
    type: 'binary',
    text: '책을 덮은 직후 드는 첫 생각은?',
    options: [
      { id: 'A', label: '여운이 남는다, 한동안 멍하다', value: 'F' },
      { id: 'B', label: '머릿속에 정리가 된다, 뭔가 얻었다', value: 'T' },
    ],
  },
  {
    id: 3,
    axis: 'FT',
    type: 'binary',
    text: '친구에게 책을 추천할 때 하는 말은?',
    options: [
      { id: 'A', label: '"이거 읽고 진짜 많이 울었어"', value: 'F' },
      { id: 'B', label: '"이거 읽으면 생각할 거리가 생겨"', value: 'T' },
    ],
  },

  // ── 축2: I/C (몰입형 / 사색형) ── Q4·Q5·Q6 모두 4지선다
  {
    id: 4,
    axis: 'IC',
    type: 'quad',
    text: '책을 읽을 때 내 모습에 가장 가까운 건?',
    options: [
      { id: 'A', label: '한번 잡으면 끝날 때까지 못 놓는다', value: 'I' },
      { id: 'B', label: '한 문장 읽고 잠깐 멈춰서 생각한다', value: 'C' },
      { id: 'C', label: '읽다 놓고, 또 읽다 놓는다', value: 'I', badgeKey: 'bookmark-prisoner' },
      { id: 'D', label: '읽는 건지 딴생각하는 건지 모르겠다', value: 'C', badgeKey: 'daydream-reader' },
    ],
  },
  {
    id: 5,
    axis: 'IC',
    type: 'quad',
    text: '독서 중 누군가 말을 걸면?',
    options: [
      { id: 'A', label: '못 들었다. 진짜로', value: 'I' },
      { id: 'B', label: '들었는데 대답하기 싫다', value: 'C' },
      { id: 'C', label: '들었고, 오히려 그게 더 생각을 자극했다', value: 'C', badgeKey: 'interrupted-thinker' },
      { id: 'D', label: '기회다! 잠깐 쉬어야겠다', value: 'I', badgeKey: 'reluctant-reader' },
    ],
  },
  {
    id: 6,
    axis: 'IC',
    type: 'quad',
    text: '책 읽는 속도는?',
    options: [
      { id: 'A', label: '빠르다. 이야기 흐름에 끌려간다', value: 'I' },
      { id: 'B', label: '느리다. 한 페이지를 여러 번 읽는다', value: 'C' },
      { id: 'C', label: '들쭉날쭉. 흥미로운 부분만 속독한다', value: 'I', badgeKey: 'selective-reader' },
      { id: 'D', label: '매우 느리다. 다 읽는 데 몇 달 걸린다', value: 'C', badgeKey: 'slow-deep-diver' },
    ],
  },

  // ── 축3: E/G (도피형 / 성장형) ── Q7·Q8 2지선다, Q9 4지선다
  {
    id: 7,
    axis: 'EG',
    type: 'binary',
    text: '책을 펼치는 주된 이유는?',
    options: [
      { id: 'A', label: '지금 현실에서 잠깐 벗어나고 싶어서', value: 'E' },
      { id: 'B', label: '뭔가 배우거나 달라지고 싶어서', value: 'G' },
    ],
  },
  {
    id: 8,
    axis: 'EG',
    type: 'binary',
    text: '책을 다 읽고 나서 뭔가 달라지길 바라나요?',
    options: [
      { id: 'A', label: '아니. 읽는 동안 즐거우면 됐다', value: 'E' },
      { id: 'B', label: '응. 뭔가 생각이나 행동이 바뀌길 바란다', value: 'G' },
    ],
  },
  {
    id: 9,
    axis: 'EG',
    type: 'quad',
    text: '최근 책을 읽은 계기가 뭐에 가장 가까워요?',
    options: [
      { id: 'A', label: '현실이 너무 힘들어서 도망치고 싶었다', value: 'E' },
      { id: 'B', label: '이 주제로 성장하고 싶어서 골랐다', value: 'G' },
      { id: 'C', label: '그냥 분위기가 좋아서, 이유 없이', value: 'E', badgeKey: 'mood-reader' },
      { id: 'D', label: '누군가 추천해줘서 읽었는데 나랑 달랐다', value: 'G', badgeKey: 'reluctant-grower' },
    ],
  },

  // ── 축4: R/W (현실형 / 환상형) ── Q10·Q11 4지선다, Q12 2지선다
  {
    id: 10,
    axis: 'RW',
    type: 'quad',
    text: '즐겨 읽는 장르에 가장 가까운 건?',
    options: [
      { id: 'A', label: '에세이, 소설, 인물 이야기 — 현실 기반', value: 'R' },
      { id: 'B', label: '판타지, SF, 세계관 있는 이야기', value: 'W' },
      { id: 'C', label: '자기계발, 경제, 과학 — 지식 위주', value: 'R', badgeKey: 'knowledge-hunter' },
      { id: 'D', label: '장르 안 가린다. 그냥 끌리면 읽는다', value: 'W', badgeKey: 'genre-nomad' },
    ],
  },
  {
    id: 11,
    axis: 'RW',
    type: 'quad',
    text: '책 속 세계관이 매력적이면?',
    options: [
      { id: 'A', label: '그 세계를 현실에서도 실현할 수 있을지 생각한다', value: 'R' },
      { id: 'B', label: '그 세계 자체에 완전히 빠진다, 나오기 싫다', value: 'W' },
      { id: 'C', label: '설정집까지 찾아 읽는다', value: 'W', badgeKey: 'worldbuilder-fan' },
      { id: 'D', label: '세계관보다 등장인물이 중요하다', value: 'R', badgeKey: 'character-first' },
    ],
  },
  {
    id: 12,
    axis: 'RW',
    type: 'binary',
    text: '만약 딱 한 권만 평생 읽을 수 있다면?',
    options: [
      { id: 'A', label: '현실 세계를 배경으로 한 책\n(소설·에세이·논픽션)', value: 'R' },
      { id: 'B', label: '완전히 다른 세계를 배경으로 한 책\n(판타지·SF·신화)', value: 'W' },
    ],
  },
]
