// 피드 포스트 Supabase CRUD — 서버가 유일한 소스. 시드·localStorage 폴백 없음.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { cachePerson } from '@/entities/person/model/people'
import type { Post } from '@/entities/post/model/posts'

/** 첨부 책 — 셋이 늘 함께 움직여서 한 덩어리로 받는다 */
export interface PostBook {
  title: string
  isbn: string | null
  cover: string | null
}

// 좋아요 여부·차단 목록은 렌더 시점에 동기로 물어보므로 메모리에 들고 있는다.
// loadPosts()가 서버에서 다시 채운다 — localStorage 캐시는 쓰지 않는다.
const likedIds = new Set<string>()
let blockedIds: string[] = []

function mapPost(row: Record<string, unknown>): Post {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
  if (profile) cachePerson(row.author_id as string, profile.nickname, profile.type_code)
  const editedAt = row.updated_at as string | null
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    authorTypeCode: profile?.type_code ?? null,
    content: row.content as string,
    bookTitle: (row.book_title as string | null) ?? null,
    bookIsbn: (row.book_isbn as string | null) ?? null,
    bookCover: (row.book_cover as string | null) ?? null,
    likeCount: (row.like_count as number) ?? 0,
    commentCount: (row.comment_count as number) ?? 0,
    ts: new Date(row.created_at as string).getTime(),
    editedTs: editedAt ? new Date(editedAt).getTime() : null,
  }
}

const SELECT = '*, profiles!author_id(nickname, type_code)'

async function refreshViewerState(sb: ReturnType<typeof createSupabaseBrowser>): Promise<void> {
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    likedIds.clear()
    blockedIds = []
    return
  }

  const [likes, blocks] = await Promise.all([
    sb.from('likes').select('target_id').eq('user_id', user.id).eq('target_type', 'post'),
    sb.from('blocks').select('blocked_id'),
  ])

  likedIds.clear()
  for (const r of (likes.data ?? []) as { target_id: string }[]) likedIds.add(r.target_id)
  blockedIds = (blocks.data ?? []).map((r) => (r as { blocked_id: string }).blocked_id)
}

/** 차단한 사람 글은 쿼리 단계에서 뺀다 — 클라이언트 필터는 페이지네이션을 어긋나게 한다 */
function blockedFilter(): string | null {
  return blockedIds.length > 0 ? `(${blockedIds.join(',')})` : null
}

/** 피드 포스트 로드 (최신순, 페이지네이션). 글이 없으면 빈 배열. */
export async function loadPosts(params?: { offset?: number; limit?: number }): Promise<Post[]> {
  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 20
  const sb = createSupabaseBrowser()
  if (offset === 0) await refreshViewerState(sb)

  let query = sb
    .from('posts')
    .select(SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const blocked = blockedFilter()
  if (blocked) query = query.not('author_id', 'in', blocked)

  const { data } = await query
  return (data ?? []).map(mapPost)
}

/** 인기글 (likeCount 기준 상위 n개) */
export async function loadPopularPosts(limit = 5): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  let query = sb.from('posts').select(SELECT).order('like_count', { ascending: false }).limit(limit)

  const blocked = blockedFilter()
  if (blocked) query = query.not('author_id', 'in', blocked)

  const { data } = await query
  return (data ?? []).map(mapPost)
}

/** 글 하나 조회 — 상세·수정 화면용. 없으면 null */
export async function loadPost(id: string): Promise<Post | null> {
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('posts').select(SELECT).eq('id', id).maybeSingle()
  return data ? mapPost(data) : null
}

/** 포스트 작성 — 로그인 필수 */
export async function createPost(params: {
  content: string
  book?: PostBook | null
}): Promise<Post> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const book = params.book ?? null
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
      book_title: book?.title ?? null,
      book_isbn: book?.isbn ?? null,
      book_cover: book?.cover ?? null,
    })
    .select()
    .single()

  if (error || !data) throw new Error(error?.message ?? '글을 저장하지 못했어요')

  return mapPost({
    ...data,
    profiles: {
      nickname: profileData?.nickname ?? '알 수 없음',
      type_code: profileData?.type_code ?? null,
    },
  })
}

/** 포스트 수정 — 본인 글만(RLS). 수정된 글을 돌려준다 */
export async function updatePost(
  id: string,
  params: { content: string; book?: PostBook | null },
): Promise<Post | null> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const book = params.book ?? null
  const { data } = await sb
    .from('posts')
    .update({
      content: params.content.trim(),
      book_title: book?.title ?? null,
      book_isbn: book?.isbn ?? null,
      book_cover: book?.cover ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(SELECT)
    .maybeSingle()

  return data ? mapPost(data) : null
}

/** 포스트 삭제 — 본인 글만(RLS). 지워졌으면 true */
export async function deletePost(id: string): Promise<boolean> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.from('posts').delete().eq('id', id)
  return !error
}

/** 지금 로그인한 사람이 이 글의 작성자인지 */
export async function isMyPost(post: Post): Promise<boolean> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  return !!user && post.authorId === user.id
}

/** 좋아요 토글 — 로그인 필수. like_count는 likes 트리거가 맞춘다 */
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

export function getLikedPostIds(): Set<string> {
  return likedIds
}

/** 방금 차단한 사람을 메모리 목록에도 반영 — 다음 로드부터 쿼리에서 빠진다 */
export function markBlocked(userId: string): void {
  if (!blockedIds.includes(userId)) blockedIds.push(userId)
}
