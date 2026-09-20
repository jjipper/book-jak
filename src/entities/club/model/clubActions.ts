// 책 모임 — Supabase clubs/club_members가 유일한 소스. 쓰기는 로그인 필수.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { recordActivity } from '@/shared/lib/activity'
import type { BookClub, ClubFormat, ClubIllustCode } from '@/entities/club/model/clubs'

// 가입 여부는 화면이 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
// getJoinedIds()가 서버에서 다시 채운다.
const joinedIds = new Set<string>()

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
  const { data } = await sb.from('clubs').select('*').order('created_at', { ascending: false })
  return (data ?? []).map(mapClub)
}

export async function loadClub(id: string): Promise<BookClub | undefined> {
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
  if (!user) throw new Error('로그인이 필요해요')

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
  if (error || !data) throw new Error(error?.message ?? '모임을 만들지 못했어요')

  await sb.from('club_members').insert({ club_id: data.id, user_id: user.id })
  joinedIds.add(data.id as string)
  recordActivity('club_create')
  return mapClub(data)
}

export function isJoined(id: string): boolean {
  return joinedIds.has(id)
}

// 모임 상세로 바로 들어오는 경로에서는 목록을 거치지 않으므로 모듈 로드 시 한 번 채워둔다.
// ponytail: 상세 로딩보다 늦게 끝나면 첫 렌더가 '미참여'로 보인다.
if (typeof window !== 'undefined') void getJoinedIds()

export async function getJoinedIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  joinedIds.clear()
  if (!user) return []
  const { data } = await sb.from('club_members').select('club_id').eq('user_id', user.id)
  for (const r of (data ?? []) as { club_id: string }[]) joinedIds.add(r.club_id)
  return [...joinedIds]
}

export async function joinClub(id: string, opts?: { silent?: boolean }): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('club_members').insert({ club_id: id, user_id: user.id })
  joinedIds.add(id)
  if (!opts?.silent) recordActivity('club_join')
}

export async function leaveClub(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  await sb.from('club_members').delete().eq('club_id', id).eq('user_id', user.id)
  joinedIds.delete(id)
}

export function displayMemberCount(club: BookClub): number {
  return club.memberCount
}
