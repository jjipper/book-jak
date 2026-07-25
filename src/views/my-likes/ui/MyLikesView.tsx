'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import { getLikedIds } from '@/features/like/model/likes'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyLikesView() {
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])

  useEffect(() => {
    const likedIds = getLikedIds()
    setQuestions(loadQuestions().filter((q) => likedIds.includes(q.id)))
  }, [])

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">좋아요 한 글</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>좋아요 한 글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              의견 나누기 보러가기
            </Link>
          </div>
        ) : (
          questions.map((q) => {
            const author = resolveAuthor(q.authorId)
            const answerCount = loadAnswers(q.id).length
            return (
              <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{bookTitle(q.bookId)}</p>
                  <p className="bj-body" style={{ fontSize: 14, marginBottom: 6 }}>{q.text}</p>
                  <p className="bj-caption">{author.nickname} · 답변 {answerCount}개</p>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}
