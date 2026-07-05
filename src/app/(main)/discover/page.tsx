'use client'

import { useState } from 'react'
import { BLIND_BOOKS } from '@/data/blindBooks'
import { saveBlindRating } from '@/lib/blindRatings'
import BlindBookCard from '@/components/discover/BlindBookCard'

export default function DiscoverPage() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)

  const total = BLIND_BOOKS.length
  const isDone = currentIdx >= total
  const book = BLIND_BOOKS[currentIdx]
  const progressPct = Math.round((completedCount / total) * 100)

  function goNext() {
    setCurrentIdx((i) => i + 1)
  }

  function handleSkip() {
    setCompletedCount((c) => c + 1)
    goNext()
  }

  function handleReveal(stars: number, reactions: string[]) {
    saveBlindRating({
      bookId: book.id,
      title: book.title,
      stars,
      reactions,
      tags: book.tags.map((t) => t.text),
      ts: Date.now(),
    })
    setCompletedCount((c) => c + 1)
  }

  function handleReset() {
    setCurrentIdx(0)
    setCompletedCount(0)
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <span className="bj-display bj-display--lg">발견</span>
        <button className="bj-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {!isDone ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px 40px' }}>
          <div style={{ marginBottom: 20 }}>
            <p className="bj-caption" style={{ marginBottom: 8 }}>
              제목·표지 숨기고 경험으로 고르는 책
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="bj-caption">{completedCount} / {total} 완료</span>
              <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>{progressPct}%</span>
            </div>
            <div className="bj-progress__track">
              <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <BlindBookCard
            key={book.id}
            book={book}
            onSkip={handleSkip}
            onReveal={handleReveal}
            onNext={goNext}
          />

          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 20 }}>
            <span className="bj-caption">← 관심 없음</span>
            <span className="bj-caption">읽고 싶어요 →</span>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 16, textAlign: 'center' }}>
          <p className="bj-h1">오늘의 탐색 완료</p>
          <p className="bj-body" style={{ color: 'var(--color-text-muted)' }}>
            {total}권의 블라인드 책을 평가했어요.<br />당신의 독서 취향 데이터가 쌓이고 있습니다.
          </p>
          <button onClick={handleReset} className="bj-btn bj-btn--primary" style={{ marginTop: 8, padding: '14px 28px' }}>
            처음부터 다시 탐색
          </button>
        </div>
      )}
    </main>
  )
}
