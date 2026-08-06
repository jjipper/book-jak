import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { recordActivity } from '@/shared/lib/activity'
import { getMyId } from '@/entities/user/model/profile'
import {
  SEED_QUESTIONS, SEED_ANSWERS,
  type DiscussionQuestion, type DiscussionAnswer,
} from '@/entities/discussion/model/discussions'

export type { DiscussionQuestion, DiscussionAnswer }

const QUESTIONS_KEY = 'book_local_questions'
const ANSWERS_KEY = 'book_local_answers'

function loadLocalQuestions(): DiscussionQuestion[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY)
    return raw ? (JSON.parse(raw) as DiscussionQuestion[]) : []
  } catch { return [] }
}

function loadLocalAnswers(): DiscussionAnswer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANSWERS_KEY)
    return raw ? (JSON.parse(raw) as DiscussionAnswer[]) : []
  } catch { return [] }
}

function mapQuestion(row: Record<string, unknown>): DiscussionQuestion {
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
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    return [...loadLocalQuestions(), ...SEED_QUESTIONS].sort((a, b) => b.ts - a.ts)
  }
  const { data } = await sb.from('discussion_questions').select('*').order('created_at', { ascending: false })
  if (data) {
    return [...data.map(mapQuestion), ...SEED_QUESTIONS].sort((a, b) => b.ts - a.ts)
  }
  return [...loadLocalQuestions(), ...SEED_QUESTIONS].sort((a, b) => b.ts - a.ts)
}

export async function loadQuestion(id: string): Promise<DiscussionQuestion | undefined> {
  // Check seed first
  const seed = SEED_QUESTIONS.find((q) => q.id === id)
  if (seed) return seed
  // Check local
  const local = loadLocalQuestions().find((q) => q.id === id)
  if (local) return local
  // Try server
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('discussion_questions').select('*').eq('id', id).maybeSingle()
  return data ? mapQuestion(data) : undefined
}

export async function loadAnswers(questionId: string): Promise<DiscussionAnswer[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    return [...SEED_ANSWERS, ...loadLocalAnswers()]
      .filter((a) => a.questionId === questionId)
      .sort((a, b) => a.ts - b.ts)
  }
  const { data } = await sb
    .from('discussion_answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true })
  if (data) {
    const serverAnswers = data.map(mapAnswer)
    const seedAnswers = SEED_ANSWERS.filter((a) => a.questionId === questionId)
    return [...seedAnswers, ...serverAnswers].sort((a, b) => a.ts - b.ts)
  }
  return [...SEED_ANSWERS, ...loadLocalAnswers()]
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => a.ts - b.ts)
}

export async function loadAllAnswers(): Promise<DiscussionAnswer[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) {
    return [...SEED_ANSWERS, ...loadLocalAnswers()].sort((a, b) => b.ts - a.ts)
  }
  const { data } = await sb.from('discussion_answers').select('*').order('created_at', { ascending: false })
  if (data) {
    return [...SEED_ANSWERS, ...data.map(mapAnswer)].sort((a, b) => b.ts - a.ts)
  }
  return [...SEED_ANSWERS, ...loadLocalAnswers()].sort((a, b) => b.ts - a.ts)
}

export async function addQuestion(params: { bookId: number | null; text: string }): Promise<DiscussionQuestion> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    const { data, error } = await sb
      .from('discussion_questions')
      .insert({ book_id: params.bookId, author_id: user.id, text: params.text })
      .select()
      .single()
    if (!error && data) {
      recordActivity('question')
      return mapQuestion(data)
    }
  }
  // Fallback: localStorage
  const question: DiscussionQuestion = {
    id: `local-q-${Date.now()}`,
    bookId: params.bookId,
    authorId: getMyId(),
    text: params.text,
    ts: Date.now(),
  }
  const stored = loadLocalQuestions()
  stored.push(question)
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(stored))
  recordActivity('question')
  return question
}

export async function addAnswer(questionId: string, text: string): Promise<DiscussionAnswer> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (user) {
    const { data, error } = await sb
      .from('discussion_answers')
      .insert({ question_id: questionId, author_id: user.id, text })
      .select()
      .single()
    if (!error && data) {
      recordActivity('answer')
      return mapAnswer(data)
    }
  }
  // Fallback: localStorage
  const answer: DiscussionAnswer = {
    id: `local-a-${Date.now()}`,
    questionId,
    authorId: getMyId(),
    text,
    ts: Date.now(),
  }
  const stored = loadLocalAnswers()
  stored.push(answer)
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(stored))
  recordActivity('answer')
  return answer
}
