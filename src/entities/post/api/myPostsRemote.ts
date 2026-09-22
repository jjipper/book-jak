// 마이 > 남긴 글 / 좋아요 한 글 — 로그인한 사람 기준 피드 글 조회.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { Post } from '@/entities/post/model/posts'
import { mapPost, POST_SELECT as SELECT } from '@/entities/post/api/postsRemote'

/** 내가 쓴 피드 글 (최신순). 로그아웃이면 빈 배열 */
export async function loadMyPosts(): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data } = await sb
    .from('posts')
    .select(SELECT)
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapPost)
}

/** 내가 좋아요 한 피드 글 (좋아요 누른 최신순). 지워진 글은 빠진다 */
export async function loadLikedPosts(): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return []
  const { data: likes } = await sb
    .from('likes')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'post')
    .order('created_at', { ascending: false })
  const ids = (likes ?? []).map((r) => (r as { target_id: string }).target_id)
  if (ids.length === 0) return []
  const { data } = await sb.from('posts').select(SELECT).in('id', ids)
  const byId = new Map((data ?? []).map((row) => [row.id as string, mapPost(row)]))
  return ids.flatMap((id) => byId.get(id) ?? [])
}
