// Phase 4 — 질문 기반 토론: 시드 데이터 + 로컬(내가 쓴 글) 병합

import { recordActivity } from '@/shared/lib/activity'
import { ME_ID } from '@/shared/config/currentUser'
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
  } catch {
    return []
  }
}

function loadLocalAnswers(): DiscussionAnswer[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANSWERS_KEY)
    return raw ? (JSON.parse(raw) as DiscussionAnswer[]) : []
  } catch {
    return []
  }
}

export function loadQuestions(): DiscussionQuestion[] {
  return [...loadLocalQuestions(), ...SEED_QUESTIONS].sort((a, b) => b.ts - a.ts)
}

export function loadQuestion(id: string): DiscussionQuestion | undefined {
  return loadQuestions().find((q) => q.id === id)
}

export function loadAnswers(questionId: string): DiscussionAnswer[] {
  return [...SEED_ANSWERS, ...loadLocalAnswers()]
    .filter((a) => a.questionId === questionId)
    .sort((a, b) => a.ts - b.ts)
}

export function loadAllAnswers(): DiscussionAnswer[] {
  return [...SEED_ANSWERS, ...loadLocalAnswers()].sort((a, b) => b.ts - a.ts)
}

export function addQuestion(params: { bookId: number | null; text: string }): DiscussionQuestion {
  const question: DiscussionQuestion = {
    id: `local-q-${Date.now()}`,
    bookId: params.bookId,
    authorId: ME_ID,
    text: params.text,
    ts: Date.now(),
  }
  const stored = loadLocalQuestions()
  stored.push(question)
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(stored))
  recordActivity('question')
  return question
}

export function addAnswer(questionId: string, text: string): DiscussionAnswer {
  const answer: DiscussionAnswer = {
    id: `local-a-${Date.now()}`,
    questionId,
    authorId: ME_ID,
    text,
    ts: Date.now(),
  }
  const stored = loadLocalAnswers()
  stored.push(answer)
  localStorage.setItem(ANSWERS_KEY, JSON.stringify(stored))
  recordActivity('answer')
  return answer
}
