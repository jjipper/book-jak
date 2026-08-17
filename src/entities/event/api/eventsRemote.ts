// 이벤트 Supabase CRUD + localStorage fallback
// clubActions.ts 패턴과 동일

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { SEED_EVENTS, type BookEvent, type LocationType } from '@/entities/event/model/events'

const LOCAL_EVENTS_KEY = 'book_local_events'
const JOINED_EVENTS_KEY = 'book_joined_events'

function loadLocalEvents(): BookEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_EVENTS_KEY)
    return raw ? (JSON.parse(raw) as BookEvent[]) : []
  } catch { return [] }
}

function mapEvent(row: Record<string, unknown>): BookEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    eventDate: (row.event_date as string | null) ?? null,
    location: (row.location as string | null) ?? null,
    locationType: (row.location_type as LocationType) ?? 'online',
    maxParticipants: (row.max_participants as number | null) ?? null,
    participantCount: (row.participant_count as number) ?? 0,
    isOfficial: (row.is_official as boolean) ?? false,
    tags: (row.tags as string[]) ?? [],
    createdBy: (row.created_by as string | null) ?? null,
  }
}

export async function loadEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
  if (data?.length) return [...SEED_EVENTS, ...data.map(mapEvent)]
  return [...SEED_EVENTS, ...loadLocalEvents()]
}

export async function loadOfficialEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('events')
    .select('*')
    .eq('is_official', true)
    .order('event_date', { ascending: true })
  if (data?.length) return data.map(mapEvent)
  return SEED_EVENTS.filter((e) => e.isOfficial)
}

export async function loadUserEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('events')
    .select('*')
    .eq('is_official', false)
    .order('created_at', { ascending: false })
  if (data?.length) return data.map(mapEvent)
  return [...SEED_EVENTS.filter((e) => !e.isOfficial), ...loadLocalEvents()]
}

function readJoinedCache(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(JOINED_EVENTS_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch { return [] }
}

function writeJoinedCache(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(JOINED_EVENTS_KEY, JSON.stringify(ids))
}

export function isJoinedEvent(id: string): boolean {
  return readJoinedCache().includes(id)
}

export async function joinEvent(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('event_participants').insert({ event_id: id, user_id: user.id })
  }
  const joined = readJoinedCache()
  if (!joined.includes(id)) writeJoinedCache([...joined, id])
}

export async function leaveEvent(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    await sb.from('event_participants').delete().eq('event_id', id).eq('user_id', user.id)
  }
  writeJoinedCache(readJoinedCache().filter((i) => i !== id))
}
