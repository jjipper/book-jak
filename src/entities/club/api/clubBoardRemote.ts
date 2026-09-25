// 모임 상세 — 멤버 목록 + QnA(club_posts). 읽기는 누구나, 쓰기는 로그인 (RLS, 0018).

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { ClubMember, ClubPost } from '@/entities/club/model/clubs'

export async function loadClubMembers(clubId: string): Promise<ClubMember[]> {
  const sb = createSupabaseBrowser()
  const { data: rows } = await sb
    .from('club_members')
    .select('user_id')
    .eq('club_id', clubId)
    .order('joined_at', { ascending: true })
  const ids = (rows ?? []).map((r) => r.user_id as string)
  if (ids.length === 0) return []
  // club_members.user_id는 profiles FK가 없어 조인 대신 한 번 더 묻는다
  const { data: profiles } = await sb.from('profiles').select('id, nickname, avatar_url').in('id', ids)
  const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]))
  return ids.map((id) => ({
    id,
    nickname: (byId.get(id)?.nickname as string | undefined) ?? '알 수 없음',
    avatarUrl: (byId.get(id)?.avatar_url as string | null | undefined) ?? null,
  }))
}

function mapPost(row: Record<string, unknown>): ClubPost {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
  return {
    id: row.id as string,
    parentId: (row.parent_id as string | null) ?? null,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    authorTypeCode: profile?.type_code ?? null,
    content: row.content as string,
    ts: new Date(row.created_at as string).getTime(),
  }
}

export interface ClubQna {
  question: ClubPost
  replies: ClubPost[]
}

/** 질문은 최신순(새 질문이 위), 답글은 오래된 순(대화 순서) */
export async function loadClubQna(clubId: string): Promise<ClubQna[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('club_posts')
    .select('*, profiles!author_id(nickname, type_code)')
    .eq('club_id', clubId)
    .order('created_at', { ascending: true })
  const posts = (data ?? []).map(mapPost)
  const threads = new Map<string, ClubQna>()
  for (const p of posts) if (p.parentId === null) threads.set(p.id, { question: p, replies: [] })
  for (const p of posts) if (p.parentId !== null) threads.get(p.parentId)?.replies.push(p)
  return [...threads.values()].reverse()
}

/** parentId를 주면 그 질문의 답글. 답글의 답글은 DB 트리거가 막는다 (0021) */
export async function createClubPost(clubId: string, content: string, parentId?: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  const { error } = await sb
    .from('club_posts')
    .insert({ club_id: clubId, author_id: user.id, content, parent_id: parentId ?? null })
  if (error) throw new Error(error.message.includes('너무 빠르게') ? error.message : '글을 남기지 못했어요')
}

export async function deleteClubPost(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.from('club_posts').delete().eq('id', id)
  if (error) throw new Error('글을 지우지 못했어요')
}
