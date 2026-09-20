import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getBlockedIds } from '@/entities/report/api/moderationRemote'
import type { PostComment } from '@/entities/comment/model/comments'

async function attachNicknames(
  rows: Record<string, unknown>[],
): Promise<PostComment[]> {
  const sb = createSupabaseBrowser()
  const ids = [...new Set(rows.map((r) => r.author_id as string))]
  const nicknames = new Map<string, string>()
  if (ids.length) {
    const { data } = await sb.from('profiles').select('id, nickname').in('id', ids)
    data?.forEach((p) => nicknames.set(p.id as string, p.nickname as string))
  }
  return rows.map((r) => ({
    id: r.id as string,
    postId: r.post_id as string,
    authorId: r.author_id as string,
    authorNickname: nicknames.get(r.author_id as string) ?? '알 수 없음',
    content: r.content as string,
    ts: new Date(r.created_at as string).getTime(),
  }))
}

/** 포스트의 댓글 목록 (차단한 유저 제외) */
export async function loadComments(postId: string): Promise<PostComment[]> {
  const sb = createSupabaseBrowser()
  let q = sb.from('comments').select('*').eq('post_id', postId).order('created_at')
  const blocked = await getBlockedIds()
  if (blocked.length) q = q.not('author_id', 'in', `(${blocked.join(',')})`)
  const { data } = await q
  return data ? attachNicknames(data) : []
}

/** 댓글 작성 — 길이·연속등록 제한은 DB 제약/트리거가 막는다 */
export async function addComment(postId: string, content: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  const { error } = await sb
    .from('comments')
    .insert({ post_id: postId, author_id: user.id, content: content.trim() })
  if (error) throw new Error(error.message)
}

export async function deleteComment(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  await sb.from('comments').delete().eq('id', id)
}

/** 내가 쓴 피드 댓글 (마이 > 남긴 댓글) */
export async function loadMyComments(): Promise<PostComment[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data } = await sb
    .from('comments')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  return data ? attachNicknames(data) : []
}
