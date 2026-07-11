// Phase 5 — 책 모임 시드 데이터
// organizerId는 MOCK_PEOPLE의 id를 참조.

export type ClubFormat = '온라인' | '오프라인'

export interface BookClub {
  id: string
  name: string
  description: string
  tags: string[]
  capacity: number
  memberCount: number
  format: ClubFormat
  organizerId: string
}

export const CLUB_TAGS = ['소설', '에세이', '판타지·SF', '스릴러', '자기계발', '시', '고전', '토론'] as const

export const SEED_CLUBS: BookClub[] = [
  { id: 'c01', name: '새벽 판타지 클럽', description: '한 달에 판타지 한 권, 완결까지 밤새는 사람들 모임', tags: ['판타지·SF'], capacity: 8, memberCount: 5, format: '온라인', organizerId: 'p01' },
  { id: 'c02', name: '울고 싶은 사람들', description: '슬픈 에세이 읽고 같이 울고 위로받는 모임', tags: ['에세이'], capacity: 6, memberCount: 6, format: '오프라인', organizerId: 'p02' },
  { id: 'c03', name: '한 문장 필사 모임', description: '매주 한 문장씩 필사하고 왜 좋았는지 나눠요', tags: ['시', '소설'], capacity: 10, memberCount: 4, format: '온라인', organizerId: 'p03' },
  { id: 'c04', name: '완독은 못해도 괜찮아', description: '자기계발서 사놓고 안 읽은 사람들의 죄책감 나눔', tags: ['자기계발'], capacity: 12, memberCount: 9, format: '온라인', organizerId: 'p04' },
  { id: 'c05', name: '스릴러 정주행단', description: '한 달에 스릴러 3권, 스포일러 금지 토론', tags: ['스릴러', '토론'], capacity: 8, memberCount: 3, format: '오프라인', organizerId: 'p05' },
  { id: 'c06', name: '질문만 있는 독서모임', description: '결론 안 냄. 질문만 계속 던지다가 헤어짐', tags: ['토론', '고전'], capacity: 6, memberCount: 2, format: '오프라인', organizerId: 'p07' },
]
