// 피드 포스트 Supabase CRUD — 서버가 유일한 소스. 시드·localStorage 폴백 없음.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { cachePerson } from '@/entities/person/model/people'
import type { Post } from '@/entities/post/model/posts'

// 좋아요 여부는 PostCard가 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
// loadPosts()가 서버에서 다시 채운다 — localStorage 캐시는 쓰지 않는다.
const likedIds = new Set<string>()

function mapPost(row: Record<string, unknown>): Post {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
  if (profile) cachePerson(row.author_id as string, profile.nickname, profile.type_code)
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    authorTypeCode: profile?.type_code ?? null,
    content: row.content as string,
    bookTitle: (row.book_title as string | null) ?? null,
    likeCount: (row.like_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
    ts: new Date(row.created_at as string).getTime(),
  }
}

const SELECT = '*, profiles!author_id(nickname, type_code)'

async function refreshLikedIds(sb: ReturnType<typeof createSupabaseBrowser>): Promise<void> {
  const { data: { user } } = await sb.auth.getUser()
  if (!user) { likedIds.clear(); return }
  const { data } = await sb
    .from('likes')
    .select('target_id')
    .eq('user_id', user.id)
    .eq('target_type', 'post')
  likedIds.clear()
  for (const r of (data ?? []) as { target_id: string }[]) likedIds.add(r.target_id)
}

/** 피드 포스트 로드 (최신순, 페이지네이션). 글이 없으면 빈 배열. */
export async function loadPosts(params?: { offset?: number; limit?: number }): Promise<Post[]> {
  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 20
  const sb = createSupabaseBrowser()
  if (offset === 0) await refreshLikedIds(sb)

  const { data } = await sb
    .from('posts')
    .select(SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return (data ?? []).map(mapPost)
}

/** 인기글 (likeCount 기준 상위 n개) */
export async function loadPopularPosts(limit = 5): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('posts')
    .select(SELECT)
    .order('like_count', { ascending: false })
    .limit(limit)
  return (data ?? []).map(mapPost)
}

/** 포스트 작성 — 로그인 필수 */
export async function createPost(params: {
  content: string
  bookTitle?: string | null
}): Promise<Post> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { data: profileData } = await sb
    .from('profiles')
    .select('nickname, type_code')
    .eq('id', user.id)
    .maybeSingle()

  const { data, error } = await sb
    .from('posts')
    .insert({
      author_id: user.id,
      content: params.content.trim(),
      book_title: params.bookTitle ?? null,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? '글을 저장하지 못했어요')

  return {
    id: data.id as string,
    authorId: user.id,
    authorNickname: profileData?.nickname ?? '알 수 없음',
    authorTypeCode: profileData?.type_code ?? null,
    content: data.content as string,
    bookTitle: (data.book_title as string | null) ?? null,
    likeCount: 0,
    commentCount: 0,
    ts: new Date(data.created_at as string).getTime(),
  }
}

/** 좋아요 토글 — 로그인 필수 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean }> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const wasLiked = likedIds.has(postId)
  if (wasLiked) {
    await sb.from('likes').delete()
      .eq('user_id', user.id).eq('target_id', postId).eq('target_type', 'post')
    likedIds.delete(postId)
  } else {
    await sb.from('likes').upsert(
      { user_id: user.id, target_id: postId, target_type: 'post' },
      { onConflict: 'user_id,target_id,target_type' },
    )
    likedIds.add(postId)
  }
  return { liked: !wasLiked }
}

export function isPostLiked(postId: string): boolean {
  return likedIds.has(postId)
}
