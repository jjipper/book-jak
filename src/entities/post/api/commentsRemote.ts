// 포스트 댓글 Supabase CRUD
// postsRemote와 같은 패턴 — 로그인 세션이 있으면 서버, 없으면 localStorage + 시드.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { getNickname, getMyId } from '@/entities/user/model/profile'
import { SEED_COMMENTS, type PostComment } from '@/entities/post/model/comments'

const LOCAL_COMMENTS_KEY = 'book_local_post_comments'

// ── localStorage helpers ──────────────────────────────────────

function loadLocalComments(): PostComment[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_COMMENTS_KEY)
    return raw ? (JSON.parse(raw) as PostComment[]) : []
  } catch { return [] }
}

function saveLocalComments(comments: PostComment[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(comments))
}

// ── Supabase row mapper ───────────────────────────────────────

function mapComment(row: Record<string, unknown>): PostComment {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
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

const COMMENT_SELECT = '*, profiles!author_id(nickname, type_code)'

// ── Public API ────────────────────────────────────────────────

/** 한 글의 댓글 — 오래된 순 (대화 흐름대로) */
export async function loadComments(postId: string): Promise<PostComment[]> {
  const local = [...SEED_COMMENTS, ...loadLocalComments()].filter((c) => c.postId === postId)

  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('post_comments')
    .select(COMMENT_SELECT)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  const server = data?.map(mapComment) ?? []
  return [...local, ...server].sort((a, b) => a.ts - b.ts)
}

/** 댓글 작성 */
export async function createComment(postId: string, content: string): Promise<PostComment> {
  const text = content.trim()
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()

  if (user) {
    const { data: profileData } = await sb
      .from('profiles')
      .select('nickname, type_code')
      .eq('id', user.id)
      .maybeSingle()

    const { data, error } = await sb
      .from('post_comments')
      .insert({ post_id: postId, author_id: user.id, content: text })
      .select()
      .single()

    if (!error && data) {
      return mapComment({
        ...data,
        profiles: { nickname: profileData?.nickname ?? getNickname() ?? '알 수 없음', type_code: profileData?.type_code ?? null },
      })
    }
  }

  const comment: PostComment = {
    id: `local-c-${Date.now()}`,
    postId,
    authorId: getMyId(),
    authorNickname: getNickname() ?? '나',
    authorTypeCode: null,
    content: text,
    ts: Date.now(),
    editedTs: null,
  }
  saveLocalComments([...loadLocalComments(), comment])
  return comment
}

/** 댓글 수정 — 본인 것만 */
export async function updateComment(id: string, content: string): Promise<PostComment | null> {
  const text = content.trim()

  const locals = loadLocalComments()
  const idx = locals.findIndex((c) => c.id === id)
  if (idx >= 0) {
    const next: PostComment = { ...locals[idx], content: text, editedTs: Date.now() }
    locals[idx] = next
    saveLocalComments(locals)
    return next
  }

  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('post_comments')
    .update({ content: text, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(COMMENT_SELECT)
    .maybeSingle()

  return data ? mapComment(data) : null
}

/** 댓글 삭제 — 본인 것만 */
export async function deleteComment(id: string): Promise<boolean> {
  const locals = loadLocalComments()
  if (locals.some((c) => c.id === id)) {
    saveLocalComments(locals.filter((c) => c.id !== id))
    return true
  }

  const sb = createSupabaseBrowser()
  const { error } = await sb.from('post_comments').delete().eq('id', id)
  return !error
}

/** 지금 로그인한 사람이 이 댓글의 작성자인지 */
export async function getMyAuthorIds(): Promise<Set<string>> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  return new Set([getMyId(), ...(user ? [user.id] : [])])
}
