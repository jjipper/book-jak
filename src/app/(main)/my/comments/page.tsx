'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/data/blindBooks'
import { loadAllAnswers, loadQuestion, type DiscussionAnswer } from '@/lib/discussions'
import { ME_ID } from '@/lib/author'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyCommentsPage() {
  const [answers, setAnswers] = useState<DiscussionAnswer[]>([])

  useEffect(() => {
    setAnswers(loadAllAnswers().filter((a) => a.authorId === ME_ID))
  }, [])

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">남긴 댓글</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {answers.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 남긴 댓글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              의견 나누기 보러가기
            </Link>
          </div>
        ) : (
          answers.map((a) => {
            const question = loadQuestion(a.questionId)
            return (
              <Link key={a.id} href={`/social/discuss/${a.questionId}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{bookTitle(question?.bookId ?? null)}</p>
                  <p className="bj-body" style={{ fontSize: 14 }}>{a.text}</p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}
