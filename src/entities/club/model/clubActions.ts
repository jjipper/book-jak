// Phase 5 — 책 모임: 시드 데이터 + 로컬(내가 만든 모임/참여 상태) 병합

import { recordActivity } from '@/shared/lib/activity'
import { ME_ID } from '@/shared/config/currentUser'
import { SEED_CLUBS, type BookClub, type ClubFormat, type ClubIllustCode } from '@/entities/club/model/clubs'

const LOCAL_CLUBS_KEY = 'book_local_clubs'
const JOINED_KEY = 'book_joined_clubs'

function loadLocalClubs(): BookClub[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CLUBS_KEY)
    return raw ? (JSON.parse(raw) as BookClub[]) : []
  } catch {
    return []
  }
}

export function loadClubs(): BookClub[] {
  return [...SEED_CLUBS, ...loadLocalClubs()]
}

export function loadClub(id: string): BookClub | undefined {
  return loadClubs().find((c) => c.id === id)
}

export function createClub(params: {
  name: string
  description: string
  tags: string[]
  capacity: number
  format: ClubFormat
  illust?: ClubIllustCode
}): BookClub {
  const club: BookClub = {
    id: `local-c-${Date.now()}`,
    name: params.name,
    description: params.description,
    tags: params.tags,
    capacity: params.capacity,
    memberCount: 1,
    format: params.format,
    organizerId: ME_ID,
    illust: params.illust,
  }
  const stored = loadLocalClubs()
  stored.push(club)
  localStorage.setItem(LOCAL_CLUBS_KEY, JSON.stringify(stored))
  joinClub(club.id, { silent: true })
  recordActivity('club_create')
  return club
}

export function getJoinedIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(JOINED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function isJoined(id: string): boolean {
  return getJoinedIds().includes(id)
}

export function joinClub(id: string, opts?: { silent?: boolean }): void {
  if (typeof window === 'undefined') return
  const joined = getJoinedIds()
  if (joined.includes(id)) return
  joined.push(id)
  localStorage.setItem(JOINED_KEY, JSON.stringify(joined))
  if (!opts?.silent) recordActivity('club_join')
}

export function leaveClub(id: string): void {
  if (typeof window === 'undefined') return
  const joined = getJoinedIds().filter((c) => c !== id)
  localStorage.setItem(JOINED_KEY, JSON.stringify(joined))
}

// 화면에 표시할 실제 인원수 = 시드/등록 인원 + 내가 참여했는지 여부(개설자는 이미 memberCount에 포함)
export function displayMemberCount(club: BookClub): number {
  if (club.organizerId === ME_ID) return club.memberCount
  return club.memberCount + (isJoined(club.id) ? 1 : 0)
}
