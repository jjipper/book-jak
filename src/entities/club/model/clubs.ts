// 책 모임 타입 — 데이터는 Supabase clubs 테이블이 유일한 소스.

export type ClubFormat = '온라인' | '오프라인'

export type ClubIllustCode =
  | 'CLUB_ADVENTURE'
  | 'CLUB_DISCUSSION'
  | 'CLUB_HEALING'
  | 'CLUB_KNOWLEDGE'
  | 'CLUB_LITERATURE'
  | 'CLUB_RANDOM'

export const CLUB_ILLUSTS: { code: ClubIllustCode; label: string }[] = [
  { code: 'CLUB_ADVENTURE', label: '모험' },
  { code: 'CLUB_DISCUSSION', label: '토론' },
  { code: 'CLUB_HEALING',   label: '힐링' },
  { code: 'CLUB_KNOWLEDGE', label: '지식' },
  { code: 'CLUB_LITERATURE', label: '문학' },
  { code: 'CLUB_RANDOM',    label: '랜덤' },
]

export interface BookClub {
  id: string
  name: string
  description: string
  tags: string[]
  capacity: number
  memberCount: number
  format: ClubFormat
  /** 오프라인 모임의 활동 지역 (온라인은 생략) */
  region?: string
  organizerId: string
  illust?: ClubIllustCode
}

export const CLUB_TAGS = ['소설', '에세이', '판타지·SF', '스릴러', '자기계발', '시', '고전', '토론'] as const
