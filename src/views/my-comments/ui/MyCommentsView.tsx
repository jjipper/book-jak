'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadAllAnswers, loadQuestion, type DiscussionAnswer } from '@/entities/discussion/model/discussionActions'
import { ME_ID } from '@/features/resolve-author/model/author'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyCommentsView() {
  const [answers, setAnswers] = useState<DiscussionAnswer[]>([])

  useEffect(() => {
    setAnswers(loadAllAnswers().filter((a) => a.authorId === ME_ID))
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">남긴 댓글</span>
      </header>

      <div className="bj-content">
        {answers.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 남긴 댓글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary bj-btn--cta">
              의견 나누기 보러가기
            </Link>
          </div>
        ) : (
          answers.map((a) => {
            const question = loadQuestion(a.questionId)
            return (
              <Link key={a.id} href={`/social/discuss/${a.questionId}`} className="bj-row bj-row--top bj-unstyled-link">
                <div className="bj-flex-1">
                  <p className="bj-caption bj-bold bj-mb-4">{bookTitle(question?.bookId ?? null)}</p>
                  <p className="bj-body bj-body--sm">{a.text}</p>
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
