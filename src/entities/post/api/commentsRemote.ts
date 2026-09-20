// 포스트 댓글 CRUD — 서버가 유일한 소스. 시드·localStorage 폴백 없음.
// posts.comment_count와 댓글 알림은 comments 트리거가 처리한다.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { cachePerson } from '@/entities/person/model/people'
import type { PostComment } from '@/entities/post/model/comments'

const SELECT = '*, profiles!author_id(nickname, type_code)'

function mapComment(row: Record<string, unknown>): PostComment {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
  if (profile) cachePerson(row.author_id as string, profile.nickname, profile.type_code)
  const editedAt = row.updated_at as string | null
  return {
    id: row.id as string,
    postId: row.post_id as string,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    authorTypeCode: profile?.type_code ?? null,
    content: row.content as string,
    ts: new Date(row.created_at as string).getTime(),
    editedTs: editedAt ? new Date(editedAt).getTime() : null,
  }
}

/** 한 글의 댓글 목록 (오래된 순). 차단한 사람 댓글은 뺀다 */
export async function loadComments(postId: string): Promise<PostComment[]> {
  const sb = createSupabaseBrowser()
  const { data: blocks } = await sb.from('blocks').select('blocked_id')
  const blocked = (blocks ?? []).map((r) => (r as { blocked_id: string }).blocked_id)

  let query = sb
    .from('comments')
    .select(SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (blocked.length > 0) query = query.not('author_id', 'in', `(${blocked.join(',')})`)

  const { data } = await query
  return (data ?? []).map(mapComment)
}

/** 댓글 등록 — 로그인 필수 */
export async function createComment(postId: string, content: string): Promise<PostComment> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { data, error } = await sb
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: content.trim() })
    .select(SELECT)
    .single()

  if (error || !data) throw new Error(error?.message ?? '댓글을 저장하지 못했어요')
  return mapComment(data)
}

/** 댓글 수정 — 본인 것만(RLS) */
export async function updateComment(id: string, content: string): Promise<PostComment | null> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { data } = await sb
    .from('comments')
    .update({ content: content.trim(), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(SELECT)
    .maybeSingle()

  return data ? mapComment(data) : null
}

/** 댓글 삭제 — 본인 것만(RLS) */
export async function deleteComment(id: string): Promise<boolean> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.from('comments').delete().eq('id', id)
  return !error
}

/** 내 댓글 판별용 — 로그인한 사람의 id. 비로그인이면 빈 Set */
export async function getMyAuthorIds(): Promise<Set<string>> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  return new Set(user ? [user.id] : [])
}

/** 마이 > 남긴 댓글 — 내가 쓴 피드 댓글 전부 (최신순) */
export async function loadMyComments(): Promise<PostComment[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []

  const { data } = await sb
    .from('comments')
    .select(SELECT)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map(mapComment)
}
