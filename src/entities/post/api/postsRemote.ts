// 피드 포스트 Supabase CRUD
// 로컬(localStorage) fallback → Supabase 동기화 레이어 패턴 (discussionActions와 동일)

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getNickname, getMyId } from '@/entities/user/model/profile'
import { SEED_POSTS, type Post } from '@/entities/post/model/posts'

const LOCAL_POSTS_KEY = 'book_local_posts'
const LOCAL_LIKED_KEY = 'book_liked_post_ids'

/** 첨부 책 — 셋이 늘 함께 움직여서 한 덩어리로 받는다 */
export interface PostBook {
  title: string
  isbn: string | null
  cover: string | null
}

// ── localStorage helpers ──────────────────────────────────────

function loadLocalPosts(): Post[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY)
    return raw ? (JSON.parse(raw) as Post[]) : []
  } catch { return [] }
}

function saveLocalPosts(posts: Post[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts))
}

function loadLikedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(LOCAL_LIKED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch { return new Set() }
}

function saveLikedIds(ids: Set<string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_LIKED_KEY, JSON.stringify([...ids]))
}

/** 시드 + 로컬 글을 최신순으로 합친 목록 (비로그인·오프라인 폴백) */
function localFeed(): Post[] {
  return [...SEED_POSTS, ...loadLocalPosts()].sort((a, b) => b.ts - a.ts)
}

// ── Supabase row mapper ───────────────────────────────────────

function mapPost(row: Record<string, unknown>): Post {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
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

const POST_SELECT = '*, profiles!author_id(nickname, type_code)'

// ── Public API ────────────────────────────────────────────────

/** 피드 포스트 로드 (최신순, 페이지네이션) */
export async function loadPosts(params?: { offset?: number; limit?: number }): Promise<Post[]> {
  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 20
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()

  if (!user) return localFeed().slice(offset, offset + limit)

  const { data } = await sb
    .from('posts')
    .select(POST_SELECT)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (data) {
    const server = data.map(mapPost)
    if (offset === 0) return [...SEED_POSTS, ...server]
    return server
  }
  return localFeed().slice(offset, offset + limit)
}

/** 인기글 (likeCount 기준 상위 n개) */
export async function loadPopularPosts(limit = 5): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('posts')
    .select(POST_SELECT)
    .order('like_count', { ascending: false })
    .limit(limit)

  if (data?.length) return data.map(mapPost)
  // 시드 데이터에서 인기글 추출
  return [...SEED_POSTS].sort((a, b) => b.likeCount - a.likeCount).slice(0, limit)
}

/** 글 하나 조회 — 상세·수정 화면용. 없으면 null */
export async function loadPost(id: string): Promise<Post | null> {
  const local = localFeed().find((p) => p.id === id)
  if (local) return local

  const sb = createSupabaseBrowser()
  const { data } = await sb.from('posts').select(POST_SELECT).eq('id', id).maybeSingle()
  return data ? mapPost(data) : null
}

/** 포스트 작성 */
export async function createPost(params: {
  content: string
  book?: PostBook | null
}): Promise<Post> {
  const content = params.content.trim()
  const book = params.book ?? null
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()

  if (user) {
    const { data: profileData } = await sb
      .from('profiles')
      .select('nickname, type_code')
      .eq('id', user.id)
      .maybeSingle()

    const { data, error } = await sb
      .from('posts')
      .insert({
        author_id: user.id,
        content,
        book_title: book?.title ?? null,
        book_isbn: book?.isbn ?? null,
        book_cover: book?.cover ?? null,
      })
      .select()
      .single()

    if (!error && data) {
      return mapPost({
        ...data,
        profiles: { nickname: profileData?.nickname ?? getNickname() ?? '알 수 없음', type_code: profileData?.type_code ?? null },
      })
    }
  }

  // localStorage fallback
  const post: Post = {
    id: `local-p-${Date.now()}`,
    authorId: getMyId(),
    authorNickname: getNickname() ?? '나',
    authorTypeCode: null,
    content,
    bookTitle: book?.title ?? null,
    bookIsbn: book?.isbn ?? null,
    bookCover: book?.cover ?? null,
    likeCount: 0,
    commentCount: 0,
    ts: Date.now(),
    editedTs: null,
  }
  saveLocalPosts([post, ...loadLocalPosts()])
  return post
}

/** 포스트 수정 — 본인 글만. 수정된 글을 돌려준다 */
export async function updatePost(
  id: string,
  params: { content: string; book?: PostBook | null },
): Promise<Post | null> {
  const content = params.content.trim()
  const book = params.book ?? null

  const locals = loadLocalPosts()
  const idx = locals.findIndex((p) => p.id === id)
  if (idx >= 0) {
    const next: Post = {
      ...locals[idx],
      content,
      bookTitle: book?.title ?? null,
      bookIsbn: book?.isbn ?? null,
      bookCover: book?.cover ?? null,
      editedTs: Date.now(),
    }
    locals[idx] = next
    saveLocalPosts(locals)
    return next
  }

  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('posts')
    .update({
      content,
      book_title: book?.title ?? null,
      book_isbn: book?.isbn ?? null,
      book_cover: book?.cover ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select(POST_SELECT)
    .maybeSingle()

  return data ? mapPost(data) : null
}

/** 포스트 삭제 — 본인 글만. 지워졌으면 true */
export async function deletePost(id: string): Promise<boolean> {
  const locals = loadLocalPosts()
  if (locals.some((p) => p.id === id)) {
    saveLocalPosts(locals.filter((p) => p.id !== id))
    return true
  }

  const sb = createSupabaseBrowser()
  const { error } = await sb.from('posts').delete().eq('id', id)
  return !error
}

/** 지금 로그인한 사람이 이 글의 작성자인지 — 서버 세션이 있으면 그쪽 id가 기준 */
export async function isMyPost(post: Post): Promise<boolean> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  return post.authorId === (user?.id ?? getMyId())
}

/** 좋아요 토글 — 낙관적 업데이트, 서버 동기화 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean }> {
  const ids = loadLikedIds()
  const wasLiked = ids.has(postId)

  if (wasLiked) ids.delete(postId)
  else ids.add(postId)
  saveLikedIds(ids)

  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    if (wasLiked) {
      await sb.from('likes').delete()
        .eq('user_id', user.id).eq('target_id', postId).eq('target_type', 'post')
      await sb.rpc('decrement_post_like', { post_id: postId })
    } else {
      await sb.from('likes').upsert(
        { user_id: user.id, target_id: postId, target_type: 'post' },
        { onConflict: 'user_id,target_id,target_type' },
      )
      await sb.rpc('increment_post_like', { post_id: postId })
    }
  }

  return { liked: !wasLiked }
}

export function isPostLiked(postId: string): boolean {
  return loadLikedIds().has(postId)
}

export function getLikedPostIds(): Set<string> {
  return loadLikedIds()
}
