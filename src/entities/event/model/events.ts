// 이벤트 타입 + 시드 데이터
// is_official = true → 운영팀 공식 이벤트 (상단 배너)
// is_official = false → 사용자 주최 모임 (하단 리스트, clubs와 유사)

export type LocationType = 'online' | 'offline'

export interface BookEvent {
  id: string
  title: string
  description: string
  eventDate: string | null // ISO 8601
  location: string | null
  locationType: LocationType
  maxParticipants: number | null
  participantCount: number
  isOfficial: boolean
  tags: string[]
  createdBy: string | null // user_id or null for official
}

export const SEED_EVENTS: BookEvent[] = [
  {
    id: 'seed-ev-1',
    title: '북작 독서 마라톤',
    description: '3시간 동안 각자 책 읽고 인증하는 온라인 이벤트. 줌 링크로 같이 켜놓고 읽어요!',
    eventDate: '2026-08-15T14:00:00+09:00',
    location: null,
    locationType: 'online',
    maxParticipants: 30,
    participantCount: 12,
    isOfficial: true,
    tags: ['온라인', '단회성'],
    createdBy: null,
  },
  {
    id: 'seed-ev-2',
    title: '책 교환 플리마켓',
    description: '홍대에서 읽은 책 가져오고 새 책 데려가기. 각자 책 1~3권 가져오면 돼요.',
    eventDate: '2026-08-23T13:00:00+09:00',
    location: '서울 마포구 홍대입구역 근처',
    locationType: 'offline',
    maxParticipants: 20,
    participantCount: 7,
    isOfficial: true,
    tags: ['오프라인', '교환', '홍대'],
    createdBy: null,
  },
  {
    id: 'seed-ev-3',
    title: 'SF 장르 입문자 모임',
    description: '삼체 읽어보고 싶었는데 혼자는 엄두 안 나는 분들 모여요. 같이 1부씩 읽고 얘기해요.',
    eventDate: '2026-08-30T19:00:00+09:00',
    location: null,
    locationType: 'online',
    maxParticipants: 8,
    participantCount: 3,
    isOfficial: false,
    tags: ['SF', '온라인', '단회성'],
    createdBy: 'seed-u-4',
  },
]
