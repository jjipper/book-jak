'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
import { ME_ID } from '@/features/resolve-author/model/author'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyPostsView() {
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])

  useEffect(() => {
    setQuestions(loadQuestions().filter((q) => q.authorId === ME_ID))
  }, [])

  return (
    <main className="bj-shell" style={{ minHeight: '100dvh' }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">남긴 글</span>
      </header>

      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 남긴 글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              질문 남기러 가기
            </Link>
          </div>
        ) : (
          questions.map((q) => {
            const answerCount = loadAnswers(q.id).length
            return (
              <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{bookTitle(q.bookId)}</p>
                  <p className="bj-body" style={{ fontSize: 14, marginBottom: 6 }}>{q.text}</p>
                  <p className="bj-caption">답변 {answerCount}개</p>
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
