'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
import { getMyId } from '@/entities/user/model/profile'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyPostsView() {
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const myId = getMyId()
      const qs = (await loadQuestions()).filter((q) => q.authorId === myId || q.authorId === 'me')
      setQuestions(qs)
      const counts: Record<string, number> = {}
      for (const q of qs) { counts[q.id] = (await loadAnswers(q.id)).length }
      setAnswerCounts(counts)
    }
    void load()
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">남긴 글</span>
      </header>

      <div className="bj-content">
        {questions.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 남긴 글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary bj-btn--cta">
              질문 남기러 가기
            </Link>
          </div>
        ) : (
          questions.map((q) => {
            return (
              <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row bj-row--top bj-unstyled-link">
                <div className="bj-flex-1">
                  <p className="bj-caption bj-bold bj-mb-4">{bookTitle(q.bookId)}</p>
                  <p className="bj-body bj-body--sm bj-mb-6">{q.text}</p>
                  <p className="bj-caption">답변 {answerCounts[q.id] ?? 0}개</p>
                </div>
              </Link>
            )
          })
        )}
      </div>
      </div>
    </main>
  )
}
