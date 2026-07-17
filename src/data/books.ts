// 평가 탭 — 책 카탈로그 데이터
// 실서비스에서는 검색 API·서버 데이터. 현재는 목업 15권 고정.
// tags는 블라인드 카드(blindBooks)와 같은 취향 태그 어휘를 공유해서
// 내 평가 이력 기반 예상 점수 계산(lib/predict.ts)에 쓰인다.

export interface Book {
  id: string
  title: string
  authorId: string
  illustCode: string
  genre: string
  mood: string // 분위기 한 줄
  difficulty: string // 난이도 (매우 쉬움/쉬움/보통/어려움)
  year: number
  pages: number
  description: string
  tags: string[]
  avgRating: number // 다른 사용자 평균 별점 (목업)
  ratingCount: number
  distribution: [number, number, number, number, number] // 1~5점 비율(%), 합 100
  relatedBookIds: string[]
}

export const BOOK_GENRES = ['전체', '장편소설', '에세이', '스릴러', 'SF', '단편집', '인문'] as const

export const BOOKS: Book[] = [
  {
    id: 'b01',
    title: '나의 투쟁 1',
    authorId: 'a02',
    illustCode: 'blind-01',
    genre: '장편소설',
    year: 2016,
    pages: 624,
    description:
      '아버지의 죽음에서 시작해 유년의 사소한 기억까지, 한 사람의 삶을 극단적인 밀도로 받아 적은 자전소설. 아무 일도 일어나지 않는 페이지가 이어지는데도 이상하게 책장을 놓을 수 없다는 평을 받는, "일상의 폭력"에 대한 기록입니다.',
    mood: '고요하고 서늘한',
    difficulty: '보통',
    tags: ['쓸쓸함', '성장소설', '잔잔함'],
    avgRating: 3.9,
    ratingCount: 428,
    distribution: [4, 8, 22, 30, 36],
    relatedBookIds: ['b15', 'b13', 'b06'],
  },
  {
    id: 'b02',
    title: '살인자의 기억법',
    authorId: 'a01',
    illustCode: 'blind-02',
    genre: '스릴러',
    year: 2013,
    pages: 148,
    description:
      '알츠하이머에 걸린 전직 연쇄살인범이 화자인 서스펜스. 딸 주변을 맴도는 남자가 살인자라는 확신은 점점 또렷해지는데, 그것을 증명할 기억은 점점 흐릿해집니다. 기억이 무너질수록 진실도 함께 무너지는 구조가 압권인 소설.',
    mood: '날카롭고 조여드는',
    difficulty: '쉬움',
    tags: ['스릴러', '긴장·불안', '몰입감'],
    avgRating: 4.1,
    ratingCount: 1842,
    distribution: [2, 5, 16, 34, 43],
    relatedBookIds: ['b09', 'b14', 'b04'],
  },
  {
    id: 'b03',
    title: '여행의 이유',
    authorId: 'a01',
    illustCode: 'book-03',
    genre: '에세이',
    year: 2019,
    pages: 216,
    description:
      '작가가 수십 년 동안 떠나고 돌아오며 생각한 것들을 모은 에세이. 여행지 정보는 한 줄도 없지만, 왜 인간은 굳이 낯선 곳으로 떠나는가에 대한 아홉 개의 답이 담겨 있습니다.',
    mood: '담담하고 사색적인',
    difficulty: '쉬움',
    tags: ['에세이', '위로', '쓸쓸함'],
    avgRating: 3.8,
    ratingCount: 2103,
    distribution: [3, 9, 25, 33, 30],
    relatedBookIds: ['b05', 'b13', 'b01'],
  },
  {
    id: 'b04',
    title: '검은 꽃',
    authorId: 'a01',
    illustCode: 'book-04',
    genre: '장편소설',
    year: 2003,
    pages: 368,
    description:
      '1905년, 멕시코 에네켄 농장으로 팔려간 조선인 1,033명의 실화를 바탕으로 한 장편. 국가를 잃은 사람들이 지구 반대편에서 겪는 생존과 사랑, 그리고 끝내 사라진 사람들의 이야기입니다.',
    mood: '묵직하고 비극적인',
    difficulty: '보통',
    tags: ['장편소설', '몰입감', '상실'],
    avgRating: 3.7,
    ratingCount: 634,
    distribution: [3, 10, 28, 32, 27],
    relatedBookIds: ['b10', 'b02', 'b09'],
  },
  {
    id: 'b05',
    title: '어떻게 살아야 할지 모르는 너에게',
    authorId: 'a03',
    illustCode: 'blind-03',
    genre: '에세이',
    year: 2021,
    pages: 160,
    description:
      '잘 하지 않아도 되는 것들에 대한 이야기. 자기계발서도 힐링서도 아닌 묘한 위치에서, "아무것도 안 해도 돼"라는 말을 가장 예쁘게 쓴 책이라는 평을 받았습니다. 힘들 때 아무 페이지나 펴서 읽는 독자가 많습니다.',
    mood: '포근하고 느린',
    difficulty: '매우 쉬움',
    tags: ['에세이', '위로', '감동'],
    avgRating: 4.0,
    ratingCount: 987,
    distribution: [2, 6, 21, 32, 39],
    relatedBookIds: ['b03', 'b11', 'b12'],
  },
  {
    id: 'b06',
    title: '군중 속의 고독',
    authorId: 'a04',
    illustCode: 'blind-04',
    genre: '인문',
    year: 1950,
    pages: 480,
    description:
      '수천만 명이 사는 도시에서 완전히 혼자인 사람들에 대한 사회학 고전. 남의 시선을 나침반 삼아 사는 "타인 지향형 인간"이라는 개념이 SNS 시대와 완벽하게 맞아떨어져, 지금 읽으면 더 뜨끔하다는 책입니다.',
    mood: '쓸쓸하고 밀도 높은',
    difficulty: '어려움',
    tags: ['도시·고독', '철학', '쓸쓸함'],
    avgRating: 3.6,
    ratingCount: 312,
    distribution: [5, 12, 30, 29, 24],
    relatedBookIds: ['b07', 'b01', 'b13'],
  },
  {
    id: 'b07',
    title: '열린 결말을 사랑한 사람들',
    authorId: 'a05',
    illustCode: 'blind-05',
    genre: '단편집',
    year: 2018,
    pages: 180,
    description:
      '결말이 없는 이야기들의 모음집. 모든 단편이 질문으로 끝나고, 독자가 그 질문을 받아 스스로 결말을 쓰게 됩니다. 답을 주지 않는 방식이 처음에는 불편하지만 나중엔 그 불편함이 좋아지는 책.',
    mood: '기묘하고 열린',
    difficulty: '보통',
    tags: ['기묘·철학', '단편집', '철학'],
    avgRating: 3.9,
    ratingCount: 256,
    distribution: [4, 7, 24, 28, 37],
    relatedBookIds: ['b08', 'b14', 'b06'],
  },
  {
    id: 'b08',
    title: '픽션들',
    authorId: 'a05',
    illustCode: 'book-08',
    genre: '단편집',
    year: 1944,
    pages: 248,
    description:
      '무한의 도서관, 갈래 나뉜 시간의 정원, 존재하지 않는 백과사전. 세계 문학사를 바꾼 단편집으로, 한 편 한 편이 소설이자 철학 퍼즐입니다. 짧지만 결코 빨리 읽히지 않는 책.',
    mood: '지적이고 미로 같은',
    difficulty: '어려움',
    tags: ['기묘·철학', '단편집', '몰입감'],
    avgRating: 4.2,
    ratingCount: 891,
    distribution: [2, 5, 15, 29, 49],
    relatedBookIds: ['b07', 'b14', 'b11'],
  },
  {
    id: 'b09',
    title: '채식주의자',
    authorId: 'a06',
    illustCode: 'book-09',
    genre: '장편소설',
    year: 2007,
    pages: 247,
    description:
      '어느 날 육식을 거부하기 시작한 한 여자와, 그녀를 둘러싼 사람들의 폭력적인 시선을 세 개의 시점으로 그린 연작 장편. 맨부커 인터내셔널상 수상작으로, 읽고 나면 오래 남는 서늘함이 있습니다.',
    mood: '서늘하고 불편한',
    difficulty: '보통',
    tags: ['장편소설', '긴장·불안', '상실'],
    avgRating: 4.0,
    ratingCount: 3241,
    distribution: [3, 7, 19, 31, 40],
    relatedBookIds: ['b10', 'b02', 'b04'],
  },
  {
    id: 'b10',
    title: '소년이 온다',
    authorId: 'a06',
    illustCode: 'book-10',
    genre: '장편소설',
    year: 2014,
    pages: 216,
    description:
      '1980년 5월 광주, 계엄군에 맞선 소년 동호와 그를 기억하는 사람들의 이야기. 인간의 잔혹함과 존엄함을 동시에 증언하는 소설로, "읽는 것 자체가 애도"라는 평을 받습니다.',
    mood: '아프고 묵직한',
    difficulty: '보통',
    tags: ['장편소설', '상실', '감동'],
    avgRating: 4.5,
    ratingCount: 2876,
    distribution: [1, 3, 10, 26, 60],
    relatedBookIds: ['b09', 'b04', 'b12'],
  },
  {
    id: 'b11',
    title: '우리가 빛의 속도로 갈 수 없다면',
    authorId: 'a07',
    illustCode: 'book-11',
    genre: 'SF',
    year: 2019,
    pages: 330,
    description:
      '우주 저편에 두고 온 가족, 사라진 행성으로 가는 마지막 우주선. 일곱 편의 SF가 낯선 미래를 배경으로 결국 그리움과 위로를 이야기합니다. SF를 한 번도 안 읽어본 사람에게 가장 많이 추천되는 책.',
    mood: '따뜻하고 아련한',
    difficulty: '쉬움',
    tags: ['SF', '단편집', '위로'],
    avgRating: 4.3,
    ratingCount: 1954,
    distribution: [1, 4, 14, 30, 51],
    relatedBookIds: ['b12', 'b08', 'b05'],
  },
  {
    id: 'b12',
    title: '지구 끝의 온실',
    authorId: 'a07',
    illustCode: 'book-12',
    genre: 'SF',
    year: 2021,
    pages: 392,
    description:
      '더스트로 멸망한 세계, 살아남은 사람들의 마을 끝에 있던 온실. 재난 이후를 다루면서도 파괴가 아니라 복원과 돌봄을 이야기하는 장편 SF입니다.',
    mood: '따뜻하고 회복적인',
    difficulty: '쉬움',
    tags: ['SF', '장편소설', '감동'],
    avgRating: 4.1,
    ratingCount: 1420,
    distribution: [2, 5, 17, 33, 43],
    relatedBookIds: ['b11', 'b10', 'b05'],
  },
  {
    id: 'b13',
    title: '노르웨이의 숲',
    authorId: 'a08',
    illustCode: 'book-13',
    genre: '장편소설',
    year: 1987,
    pages: 448,
    description:
      '스무 살 무렵의 사랑과 상실을 담담하게 그린 장편. 죽은 친구의 연인을 사랑하게 된 와타나베의 이야기로, 지나간 시절을 통과해본 사람이라면 어디선가 자기 얘기를 만나게 되는 소설입니다.',
    mood: '쓸쓸하고 아련한',
    difficulty: '쉬움',
    tags: ['장편소설', '쓸쓸함', '사랑'],
    avgRating: 4.0,
    ratingCount: 2688,
    distribution: [3, 6, 20, 32, 39],
    relatedBookIds: ['b14', 'b01', 'b03'],
  },
  {
    id: 'b14',
    title: '1Q84',
    authorId: 'a08',
    illustCode: 'book-14',
    genre: '장편소설',
    year: 2009,
    pages: 1200,
    description:
      '달이 두 개 뜬 1984년의 평행세계에서 엇갈리는 두 남녀의 이야기. 현실과 환상의 경계가 무너지는 3부작 대장편으로, 길이에 겁먹고 시작했다가 사흘 만에 끝내는 독자가 많습니다.',
    mood: '기묘하고 몰입되는',
    difficulty: '보통',
    tags: ['장편소설', '기묘·철학', '몰입감'],
    avgRating: 3.8,
    ratingCount: 1765,
    distribution: [4, 8, 24, 32, 32],
    relatedBookIds: ['b13', 'b08', 'b02'],
  },
  {
    id: 'b15',
    title: '나의 투쟁 2',
    authorId: 'a02',
    illustCode: 'book-15',
    genre: '장편소설',
    year: 2016,
    pages: 712,
    description:
      '사랑에 빠지고, 결혼하고, 아이를 키우는 일상의 안쪽을 집요하게 기록한 두 번째 권. 유모차를 끌며 자존심이 무너지는 장면조차 그대로 적어내는 정직함이 이 시리즈의 핵심입니다.',
    mood: '정직하고 일상적인',
    difficulty: '보통',
    tags: ['쓸쓸함', '성장소설', '에세이'],
    avgRating: 3.7,
    ratingCount: 214,
    distribution: [5, 9, 26, 31, 29],
    relatedBookIds: ['b01', 'b13', 'b03'],
  },
]

export function getBook(id: string): Book | undefined {
  return BOOKS.find((b) => b.id === id)
}

// 사람들 리뷰 목업 — personId는 MOCK_PEOPLE id
export interface MockBookReview {
  bookId: string
  personId: string
  stars: number
  text: string
}

const MOCK_BOOK_REVIEWS: MockBookReview[] = [
  { bookId: 'b01', personId: 'p03', stars: 5, text: '아무 일도 안 일어나는데 밑줄 친 문장이 서른 개가 넘어요.' },
  { bookId: 'b01', personId: 'p05', stars: 3, text: '속도가 안 나서 힘들었는데, 다 읽고 나니 이상하게 계속 생각남.' },
  { bookId: 'b02', personId: 'p05', stars: 5, text: '지하철에서 읽다가 정류장 두 번 놓쳤습니다. 하루면 다 읽어요.' },
  { bookId: 'b02', personId: 'p08', stars: 4, text: '기억이 무너지는 구조 자체가 트릭. 다 읽고 처음부터 다시 읽게 됨.' },
  { bookId: 'b03', personId: 'p02', stars: 4, text: '여행 에세이인 줄 알고 샀는데 인생 얘기였어요. 그래서 더 좋았음.' },
  { bookId: 'b03', personId: 'p12', stars: 4, text: '떠나고 싶을 때마다 대신 펴보는 책.' },
  { bookId: 'b04', personId: 'p08', stars: 4, text: '이런 역사가 있는 줄 몰랐다는 게 부끄러워지는 소설.' },
  { bookId: 'b04', personId: 'p01', stars: 3, text: '몰입은 되는데 마음이 무거워서 쉬엄쉬엄 읽었어요.' },
  { bookId: 'b05', personId: 'p02', stars: 5, text: '출퇴근길에 읽다가 눈물 날 뻔한 게 한두 번이 아님.' },
  { bookId: 'b05', personId: 'p09', stars: 4, text: '선물용으로 세 권째 사는 중입니다.' },
  { bookId: 'b06', personId: 'p11', stars: 4, text: '1950년에 쓴 책이 지금 내 SNS 사용 패턴을 설명함. 소름.' },
  { bookId: 'b06', personId: 'p06', stars: 4, text: '딱딱하지만 개념 하나는 확실히 남는 책. "타인 지향형" 이거 나잖아.' },
  { bookId: 'b07', personId: 'p07', stars: 5, text: '읽고 나서 친구한테 "이게 무슨 뜻 같아?" 스무 번은 물어봄.' },
  { bookId: 'b07', personId: 'p11', stars: 3, text: '명확한 답을 좋아하는 저에겐 조금 답답했어요.' },
  { bookId: 'b08', personId: 'p06', stars: 5, text: '단편 하나 읽고 사흘 딴생각하게 만드는 책. 무한 재독각.' },
  { bookId: 'b08', personId: 'p07', stars: 5, text: '바벨의 도서관 한 편만으로도 별 다섯 개.' },
  { bookId: 'b09', personId: 'p08', stars: 4, text: '세 개의 시점이 전부 폭력이라는 게 이 소설의 진짜 공포.' },
  { bookId: 'b09', personId: 'p03', stars: 4, text: '문장은 아름다운데 내용은 서늘해서 이상한 독서 경험이었어요.' },
  { bookId: 'b10', personId: 'p02', stars: 5, text: '읽는 내내 울었습니다. 그래도 읽어야 하는 책.' },
  { bookId: 'b10', personId: 'p04', stars: 5, text: '한국인이라면 한 번은 통과해야 하는 소설이라고 생각해요.' },
  { bookId: 'b11', personId: 'p10', stars: 5, text: 'SF 입문자에게 무조건 이 책부터 추천합니다. 과학으로 쓴 위로.' },
  { bookId: 'b11', personId: 'p02', stars: 4, text: 'SF인데 울었어요. 순례자들은 왜 돌아오지 않는가 최고.' },
  { bookId: 'b12', personId: 'p10', stars: 4, text: '멸망 이후를 이렇게 따뜻하게 그릴 수 있다니.' },
  { bookId: 'b12', personId: 'p09', stars: 4, text: '식물 키우는 사람이라면 두 배로 좋아할 이야기.' },
  { bookId: 'b13', personId: 'p12', stars: 4, text: '스무 살에 읽고 서른에 다시 읽었는데 완전히 다른 책이었음.' },
  { bookId: 'b13', personId: 'p01', stars: 4, text: '분위기에 잠기는 맛으로 읽는 소설. 겨울에 읽으면 배가 됨.' },
  { bookId: 'b14', personId: 'p01', stars: 4, text: '1200페이지가 무섭지만 시작하면 어차피 끝까지 갑니다.' },
  { bookId: 'b14', personId: 'p07', stars: 3, text: '떡밥을 다 회수 안 해주는데, 그게 하루키죠.' },
  { bookId: 'b15', personId: 'p03', stars: 4, text: '1권보다 아픈데 1권보다 웃겨요. 유모차 장면 최고.' },
  { bookId: 'b15', personId: 'p05', stars: 3, text: '시리즈 완주 도전 중. 2권에서 잠시 쉬는 중입니다.' },
]

export function getBookReviews(bookId: string): MockBookReview[] {
  return MOCK_BOOK_REVIEWS.filter((r) => r.bookId === bookId)
}
