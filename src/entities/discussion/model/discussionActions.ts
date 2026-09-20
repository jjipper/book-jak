// 토론 질문·답변 — Supabase discussion_* 테이블이 유일한 소스. 쓰기는 로그인 필수.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { recordActivity } from '@/shared/lib/activity'
import { cachePerson } from '@/entities/person/model/people'
import type { DiscussionQuestion, DiscussionAnswer } from '@/entities/discussion/model/discussions'

export type { DiscussionQuestion, DiscussionAnswer }

// 작성자 표시용 프로필을 같이 가져와 캐시에 넣는다 (resolveAuthor가 동기로 꺼내 쓴다)
const SELECT = '*, profiles!author_id(nickname, type_code)'

function cacheAuthor(row: Record<string, unknown>): void {
  const profile = row.profiles as { nickname: string; type_code: string | null } | null
  if (profile) cachePerson(row.author_id as string, profile.nickname, profile.type_code)
}

function mapQuestion(row: Record<string, unknown>): DiscussionQuestion {
  cacheAuthor(row)
  return {
    id: row.id as string,
    bookId: (row.book_id as number | null) ?? null,
    authorId: row.author_id as string,
    text: row.text as string,
    likeCount: (row.like_count as number) ?? 0,
    ts: new Date(row.created_at as string).getTime(),
  }
}

function mapAnswer(row: Record<string, unknown>): DiscussionAnswer {
  cacheAuthor(row)
  return {
    id: row.id as string,
    questionId: row.question_id as string,
    authorId: row.author_id as string,
    text: row.text as string,
    ts: new Date(row.created_at as string).getTime(),
  }
}

export async function loadQuestions(): Promise<DiscussionQuestion[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('discussion_questions')
    .select(SELECT)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapQuestion)
}

export async function loadQuestion(id: string): Promise<DiscussionQuestion | undefined> {
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('discussion_questions').select(SELECT).eq('id', id).maybeSingle()
  return data ? mapQuestion(data) : undefined
}

export async function loadAnswers(questionId: string): Promise<DiscussionAnswer[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('discussion_answers')
    .select(SELECT)
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })
  return (data ?? []).map(mapAnswer)
}

export async function loadAllAnswers(): Promise<DiscussionAnswer[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('discussion_answers')
    .select(SELECT)
    .order('created_at', { ascending: false })
  return (data ?? []).map(mapAnswer)
}

export async function addQuestion(params: { bookId: number | null; text: string }): Promise<DiscussionQuestion> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { data, error } = await sb
    .from('discussion_questions')
    .insert({ book_id: params.bookId, author_id: user.id, text: params.text })
    .select(SELECT)
    .single()
  if (error || !data) throw new Error(error?.message ?? '질문을 저장하지 못했어요')
  recordActivity('question')
  return mapQuestion(data)
}

export async function addAnswer(questionId: string, text: string): Promise<DiscussionAnswer> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) throw new Error('로그인이 필요해요')

  const { data, error } = await sb
    .from('discussion_answers')
    .insert({ question_id: questionId, author_id: user.id, text })
    .select(SELECT)
    .single()
  if (error || !data) throw new Error(error?.message ?? '답변을 저장하지 못했어요')
  recordActivity('answer')
  return mapAnswer(data)
}
