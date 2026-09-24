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

// 일러스트를 고르지 않은 모임(공식·이관 모임 등)도 그림이 있어야 한다.
// 태그로 분위기를 먼저 맞추고, 태그가 없으면 id 해시로 고정 배정한다(같은 모임은 항상 같은 그림).
const TAG_ILLUST: Record<string, ClubIllustCode> = {
  '토론': 'CLUB_DISCUSSION',
  '판타지·SF': 'CLUB_ADVENTURE',
  '스릴러': 'CLUB_ADVENTURE',
  '에세이': 'CLUB_HEALING',
  '시': 'CLUB_HEALING',
  '자기계발': 'CLUB_KNOWLEDGE',
  '소설': 'CLUB_LITERATURE',
  '고전': 'CLUB_LITERATURE',
}

export function clubIllust(club: Pick<BookClub, 'id' | 'illust' | 'tags'>): ClubIllustCode {
  if (club.illust) return club.illust
  for (const tag of club.tags) {
    const code = TAG_ILLUST[tag]
    if (code) return code
  }
  let hash = 0
  for (let i = 0; i < club.id.length; i += 1) hash = (hash * 31 + club.id.charCodeAt(i)) >>> 0
  return CLUB_ILLUSTS[hash % CLUB_ILLUSTS.length].code
}

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
  /** 운영팀 공식 모임은 주최자가 없을 수 있다 */
  organizerId: string | null
  illust?: ClubIllustCode
  /** 북작 공식 모임 — DB에서만 설정 */
  isOfficial: boolean
  /** 모임 일시 (ISO, 선택) */
  startsAt?: string
}

export interface ClubMember {
  id: string
  nickname: string
  avatarUrl: string | null
}

export interface ClubPost {
  id: string
  authorId: string
  authorNickname: string
  authorTypeCode: string | null
  content: string
  ts: number
}

export const CLUB_TAGS = ['소설', '에세이', '판타지·SF', '스릴러', '자기계발', '시', '고전', '토론'] as const
