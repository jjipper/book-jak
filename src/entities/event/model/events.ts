// 이벤트 타입 — 데이터는 Supabase events 테이블이 유일한 소스.
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
