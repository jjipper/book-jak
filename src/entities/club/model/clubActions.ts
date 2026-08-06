import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { recordActivity } from '@/shared/lib/activity'
import { getMyId } from '@/entities/user/model/profile'
import { SEED_CLUBS, type BookClub, type ClubFormat, type ClubIllustCode } from '@/entities/club/model/clubs'

const LOCAL_CLUBS_KEY = 'book_local_clubs'
const JOINED_KEY = 'book_joined_clubs'

function loadLocalClubs(): BookClub[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_CLUBS_KEY)
    return raw ? (JSON.parse(raw) as BookClub[]) : []
  } catch { return [] }
}

function mapClub(row: Record<string, unknown>): BookClub {
  return {
    id: row.id as string,
    name: row.name as string,
    description: row.description as string,
    tags: (row.tags as string[]) ?? [],
    capacity: row.capacity as number,
    memberCount: row.member_count as number,
    format: row.format as ClubFormat,
    region: (row.region as string | null) ?? undefined,
    organizerId: row.organizer_id as string,
    illust: (row.illust as ClubIllustCode | null) ?? undefined,
  }
}

export async function loadClubs(): Promise<BookClub[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    return [...SEED_CLUBS, ...loadLocalClubs()]
  }
  const { data } = await sb.from('clubs').select('*').order('created_at', { ascending: false })
  if (data) {
    return [...SEED_CLUBS, ...data.map(mapClub)]
  }
  return [...SEED_CLUBS, ...loadLocalClubs()]
}

export async function loadClub(id: string): Promise<BookClub | undefined> {
  const seed = SEED_CLUBS.find((c) => c.id === id)
  if (seed) return seed
  const local = loadLocalClubs().find((c) => c.id === id)
  if (local) return local
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('clubs').select('*').eq('id', id).maybeSingle()
  return data ? mapClub(data) : undefined
}

export async function createClub(params: {
  name: string
  description: string
  tags: string[]
  capacity: number
  format: ClubFormat
  illust?: ClubIllustCode
}): Promise<BookClub> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    const { data, error } = await sb
      .from('clubs')
      .insert({
        name: params.name,
        description: params.description,
        tags: params.tags,
        capacity: params.capacity,
        format: params.format,
        illust: params.illust ?? null,
        organizer_id: user.id,
        member_count: 1,
      })
      .select()
      .single()
    if (!error && data) {
      await sb.from('club_members').insert({ club_id: data.id, user_id: user.id })
      const joined = readJoinedCache()
      writeJoinedCache([...joined, data.id])
      recordActivity('club_create')
      return mapClub(data)
    }
  }
  // Fallback: localStorage
  const myId = getMyId()
  const club: BookClub = {
    id: `local-c-${Date.now()}`,
    name: params.name,
    description: params.description,
    tags: params.tags,
    capacity: params.capacity,
    memberCount: 1,
    format: params.format,
    organizerId: myId,
    illust: params.illust,
  }
  const stored = loadLocalClubs()
  stored.push(club)
  localStorage.setItem(LOCAL_CLUBS_KEY, JSON.stringify(stored))
  const joined = readJoinedCache()
  writeJoinedCache([...joined, club.id])
  recordActivity('club_create')
  return club
}

function readJoinedCache(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(JOINED_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

function writeJoinedCache(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JOINED_KEY, JSON.stringify(ids))
}

export function isJoined(id: string): boolean {
  return readJoinedCache().includes(id)
}

export async function getJoinedIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return readJoinedCache()
  const { data } = await sb.from('club_members').select('club_id').eq('user_id', user.id)
  const ids = (data ?? []).map((r: { club_id: string }) => r.club_id)
  writeJoinedCache(ids)
  return ids
}

export async function joinClub(id: string, opts?: { silent?: boolean }): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('club_members').insert({ club_id: id, user_id: user.id })
  }
  const joined = readJoinedCache()
  if (!joined.includes(id)) writeJoinedCache([...joined, id])
  if (!opts?.silent) recordActivity('club_join')
}

export async function leaveClub(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('club_members').delete().eq('club_id', id).eq('user_id', user.id)
  }
  writeJoinedCache(readJoinedCache().filter((c) => c !== id))
}

export function displayMemberCount(club: BookClub): number {
  const myId = getMyId()
  if (club.organizerId === myId) return club.memberCount
  return club.memberCount + (isJoined(club.id) ? 1 : 0)
}
