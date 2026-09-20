// 이벤트 — Supabase events/event_participants가 유일한 소스. 쓰기는 로그인 필수.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { BookEvent, LocationType } from '@/entities/event/model/events'

// 참가 여부는 화면이 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
const joinedEventIds = new Set<string>()

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

async function refreshJoined(sb: ReturnType<typeof createSupabaseBrowser>): Promise<void> {
  const { data: { user } } = await sb.auth.getUser()
  joinedEventIds.clear()
  if (!user) return
  const { data } = await sb.from('event_participants').select('event_id').eq('user_id', user.id)
  for (const r of (data ?? []) as { event_id: string }[]) joinedEventIds.add(r.event_id)
}

export async function loadEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  await refreshJoined(sb)
  const { data } = await sb.from('events').select('*').order('event_date', { ascending: true })
  return (data ?? []).map(mapEvent)
}

export async function loadOfficialEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  await refreshJoined(sb)
  const { data } = await sb
    .from('events')
    .select('*')
    .eq('is_official', true)
    .order('event_date', { ascending: true })
  return (data ?? []).map(mapEvent)
}

export async function loadUserEvents(): Promise<BookEvent[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('events')
    .select('*')
    .eq('is_official', false)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapEvent)
}

export function isJoinedEvent(id: string): boolean {
  return joinedEventIds.has(id)
}

export async function joinEvent(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('event_participants').insert({ event_id: id, user_id: user.id })
  joinedEventIds.add(id)
}

export async function leaveEvent(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('event_participants').delete().eq('event_id', id).eq('user_id', user.id)
  joinedEventIds.delete(id)
}
