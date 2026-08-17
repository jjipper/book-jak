// 피드 포스트 Supabase CRUD
// 로컬(localStorage) fallback → Supabase 동기화 레이어 패턴 (discussionActions와 동일)

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getNickname, getMyId } from '@/entities/user/model/profile'
import { SEED_POSTS, type Post } from '@/entities/post/model/posts'

const LOCAL_POSTS_KEY = 'book_local_posts'
const LOCAL_LIKED_KEY = 'book_liked_post_ids'

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

// ── Supabase row mapper ───────────────────────────────────────

function mapPost(row: Record<string, unknown>): Post {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
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

// ── Public API ────────────────────────────────────────────────

/** 피드 포스트 로드 (최신순, 페이지네이션) */
export async function loadPosts(params?: { offset?: number; limit?: number }): Promise<Post[]> {
  const offset = params?.offset ?? 0
  const limit = params?.limit ?? 20
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()

  if (!user) {
    const all = [...SEED_POSTS, ...loadLocalPosts()].sort((a, b) => b.ts - a.ts)
    return all.slice(offset, offset + limit)
  }

  const { data } = await sb
    .from('posts')
    .select('*, profiles!author_id(nickname, type_code)')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (data) {
    const server = data.map(mapPost)
    if (offset === 0) return [...SEED_POSTS, ...server]
    return server
  }
  const all = [...SEED_POSTS, ...loadLocalPosts()].sort((a, b) => b.ts - a.ts)
  return all.slice(offset, offset + limit)
}

/** 인기글 (likeCount 기준 상위 n개) */
export async function loadPopularPosts(limit = 5): Promise<Post[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('posts')
    .select('*, profiles!author_id(nickname, type_code)')
    .order('like_count', { ascending: false })
    .limit(limit)

  if (data?.length) return data.map(mapPost)
  // 시드 데이터에서 인기글 추출
  return [...SEED_POSTS].sort((a, b) => b.likeCount - a.likeCount).slice(0, limit)
}

/** 포스트 작성 */
export async function createPost(params: {
  content: string
  bookTitle?: string | null
}): Promise<Post> {
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
        content: params.content.trim(),
        book_title: params.bookTitle ?? null,
      })
      .select()
      .single()

    if (!error && data) {
      return {
        id: data.id as string,
        authorId: user.id,
        authorNickname: profileData?.nickname ?? getNickname() ?? '알 수 없음',
        authorTypeCode: profileData?.type_code ?? null,
        content: data.content as string,
        bookTitle: (data.book_title as string | null) ?? null,
        likeCount: 0,
        commentCount: 0,
        ts: new Date(data.created_at as string).getTime(),
      }
    }
  }

  // localStorage fallback
  const post: Post = {
    id: `local-p-${Date.now()}`,
    authorId: getMyId(),
    authorNickname: getNickname() ?? '나',
    authorTypeCode: null,
    content: params.content.trim(),
    bookTitle: params.bookTitle ?? null,
    likeCount: 0,
    commentCount: 0,
    ts: Date.now(),
  }
  saveLocalPosts([post, ...loadLocalPosts()])
  return post
}

/** 좋아요 토글 — 낙관적 업데이트, 서버 동기화 */
export async function togglePostLike(postId: string): Promise<{ liked: boolean; count: number }> {
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

  return { liked: !wasLiked, count: 0 }
}

export function isPostLiked(postId: string): boolean {
  return loadLikedIds().has(postId)
}

export function getLikedPostIds(): Set<string> {
  return loadLikedIds()
}
