// 책 추천 Supabase CRUD. 규칙(본인 요청 추천 불가·닫힌 요청 불가·1인 10권)은 DB 트리거가 강제한다 (0016).

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { PostBook } from '@/entities/post/api/postsRemote'
import { REC_LIMIT_PER_USER, type RecRequest, type RecSort, type Recommendation } from '@/entities/recommendation/model/recommendations'

type Profile = { nickname: string; type_code?: string | null } | null

function mapRequest(row: Record<string, unknown>): RecRequest {
  const profile = row.profiles as Profile
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    typeCode: (row.type_code as string | null) ?? null,
    title: row.title as string,
    mood: (row.mood as string | null) ?? null,
    bookTitle: (row.book_title as string | null) ?? null,
    bookIsbn: (row.book_isbn as string | null) ?? null,
    bookCover: (row.book_cover as string | null) ?? null,
    isOpen: row.is_open as boolean,
    recCount: (row.rec_count as number) ?? 0,
    readerCount: (row.reader_count as number) ?? 0,
    ts: new Date(row.created_at as string).getTime(),
  }
}

function mapRecommendation(row: Record<string, unknown>): Recommendation {
  const profile = row.profiles as Profile
  const reads = (row.rec_reads as Record<string, unknown>[] | null) ?? []
  return {
    id: row.id as string,
    authorId: row.author_id as string,
    authorNickname: profile?.nickname ?? '알 수 없음',
    authorTypeCode: profile?.type_code ?? null,
    bookTitle: row.book_title as string,
    bookIsbn: (row.book_isbn as string | null) ?? null,
    bookCover: (row.book_cover as string | null) ?? null,
    reason: row.reason as string,
    reads: reads.map((r) => ({
      userId: r.user_id as string,
      nickname: (r.profiles as Profile)?.nickname ?? '알 수 없음',
      rating: r.rating == null ? null : Number(r.rating),
      review: (r.review as string | null) ?? null,
    })),
    ts: new Date(row.created_at as string).getTime(),
  }
}

const REQUEST_SELECT = '*, profiles!author_id(nickname)'

export async function loadRecRequests(sort: RecSort): Promise<RecRequest[]> {
  const sb = createSupabaseBrowser()
  let q = sb.from('rec_requests').select(REQUEST_SELECT)
  // 인기 = rec_count + reader_count × 2 (DB generated column)
  if (sort === 'popular') q = q.order('popularity', { ascending: false })
  const { data } = await q.order('created_at', { ascending: false }).limit(50)
  return (data ?? []).map(mapRequest)
}

export async function loadRecRequest(id: string): Promise<RecRequest | null> {
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('rec_requests').select(REQUEST_SELECT).eq('id', id).maybeSingle()
  return data ? mapRequest(data) : null
}

export async function loadRecommendations(requestId: string): Promise<Recommendation[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('recommendations')
    .select('*, profiles!author_id(nickname, type_code), rec_reads(*, profiles!user_id(nickname))')
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })
  return (data ?? []).map(mapRecommendation)
}

async function requireUserId(sb: ReturnType<typeof createSupabaseBrowser>): Promise<string> {
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')
  return user.id
}

export async function createRecRequest(title: string, mood: string, book: PostBook | null): Promise<string> {
  const sb = createSupabaseBrowser()
  const uid = await requireUserId(sb)
  const { data, error } = await sb
    .from('rec_requests')
    .insert({
      author_id: uid,
      title,
      mood: mood || null,
      book_title: book?.title ?? null,
      book_isbn: book?.isbn ?? null,
      book_cover: book?.cover ?? null,
    })
    .select('id')
    .single()
  if (error || !data) throw new Error(error?.message.includes('너무 빠르게') ? error.message : '요청을 올리지 못했어요')
  return data.id as string
}

export async function setRecRequestOpen(id: string, isOpen: boolean): Promise<void> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.from('rec_requests').update({ is_open: isOpen }).eq('id', id)
  if (error) throw new Error('상태를 바꾸지 못했어요')
}

const REC_ERRORS: Record<string, string> = {
  rec_self: '내 요청에는 추천할 수 없어요',
  rec_closed: '추천이 닫힌 요청이에요',
  rec_limit: `한 요청에 ${REC_LIMIT_PER_USER}권까지 추천할 수 있어요`,
}

export async function createRecommendation(requestId: string, book: PostBook, reason: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const uid = await requireUserId(sb)
  const { error } = await sb.from('recommendations').insert({
    request_id: requestId,
    author_id: uid,
    book_title: book.title,
    book_isbn: book.isbn,
    book_cover: book.cover,
    reason,
  })
  if (error) {
    const key = Object.keys(REC_ERRORS).find((k) => error.message.includes(k))
    throw new Error(key ? REC_ERRORS[key] : error.message.includes('너무 빠르게') ? error.message : '추천하지 못했어요')
  }
}

/** 읽을게요 토글 */
export async function setReading(recommendationId: string, reading: boolean): Promise<void> {
  const sb = createSupabaseBrowser()
  const uid = await requireUserId(sb)
  const { error } = reading
    ? await sb.from('rec_reads').insert({ recommendation_id: recommendationId, user_id: uid })
    : await sb.from('rec_reads').delete().eq('recommendation_id', recommendationId).eq('user_id', uid)
  if (error) throw new Error('반영하지 못했어요')
}

export async function saveRecReview(recommendationId: string, rating: number | null, review: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const uid = await requireUserId(sb)
  const { error } = await sb
    .from('rec_reads')
    .update({ rating, review })
    .eq('recommendation_id', recommendationId)
    .eq('user_id', uid)
  if (error) throw new Error('후기를 남기지 못했어요')
}
