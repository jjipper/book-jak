// 포스트 단건 조회 / 삭제 (상세 화면 · 더보기 시트)

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { Post } from '@/entities/post/model/posts'

export async function loadPost(id: string): Promise<Post | null> {
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('posts').select('*').eq('id', id).maybeSingle()
  if (!data) return null

  const { data: profile } = await sb
    .from('profiles')
    .select('nickname, type_code')
    .eq('id', data.author_id as string)
    .maybeSingle()

  return {
    id: data.id as string,
    authorId: data.author_id as string,
    authorNickname: (profile?.nickname as string) ?? '알 수 없음',
    authorTypeCode: (profile?.type_code as string | null) ?? null,
    content: data.content as string,
    bookTitle: (data.book_title as string | null) ?? null,
    likeCount: (data.like_count as number) ?? 0,
    commentCount: (data.comment_count as number) ?? 0,
    ts: new Date(data.created_at as string).getTime(),
  }
}

/** 내 포스트 삭제 (RLS: 본인만 삭제) */
export async function deletePost(id: string): Promise<void> {
  const sb = createSupabaseBrowser()
  await sb.from('posts').delete().eq('id', id)
}
