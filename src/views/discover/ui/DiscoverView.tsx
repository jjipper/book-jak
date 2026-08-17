'use client'

import { useEffect, useState } from 'react'
import { addToWishlist } from '@/features/wishlist/model/wishlist'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { pickDailyBooks, dateKeyOf, BOOKS_PER_DAY } from '@/entities/blind-book/model/dailyDiscover'
import { recordBlindReaction } from '@/entities/blind-book/model/blindReactions'
import BlindBookCard from '@/widgets/blind-book-card/BlindBookCard'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'

export default function DiscoverView() {
  const [mounted, setMounted] = useState(false)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    setMounted(true)
  }, [])

  const dateKey = dateKeyOf(new Date())
  const books = mounted ? pickDailyBooks(dateKey) : []
  const total = Math.min(BOOKS_PER_DAY, BLIND_BOOKS.length)
  const isDone = currentIdx >= total
  const book = books[currentIdx]
  const progressPct = Math.round((completedCount / total) * 100)

  function handlePass() {
    if (book) recordBlindReaction(book.id, 'pass')
    setCompletedCount((c) => c + 1)
    setCurrentIdx((i) => i + 1)
  }

  function handleSave() {
    if (!book) return
    requireAuth(() => {
      addToWishlist({
        bookId: `blind-${book.id}`,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        illustCode: book.illustCode,
        ts: Date.now(),
      })
      recordBlindReaction(book.id, 'save')
      setCompletedCount((c) => c + 1)
      setCurrentIdx((i) => i + 1)
    })
  }

  function handleReset() {
    setCurrentIdx(0)
    setCompletedCount(0)
  }

  return (
    <main className="bj-shell bj-shell--col">
      <div className="bj-frame bj-frame--col">
        <header className="bj-page-head">
          <span className="bj-display bj-display--lg">발견</span>
          <p className="bj-caption">오늘의 블라인드 책 {total}권 · 매일 새로 공개</p>
        </header>

        {!mounted ? (
          <div className="bj-flex-spacer" />
        ) : !isDone ? (
          <div className="bj-day-content">
            <div className="bj-progress-head">
              <div className="bj-row-between bj-mb-6">
                <span className="bj-caption">{completedCount} / {total}</span>
                <span className="bj-caption bj-bold bj-text-action">{progressPct}%</span>
              </div>
              <div className="bj-progress__track">
                <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <BlindBookCard
              key={`today-${book.id}`}
              book={book}
              onPass={handlePass}
              onSave={handleSave}
            />

            <div className="bj-hint-row">
              <span className="bj-caption">← 패스</span>
              <span className="bj-caption">서재에 담기 →</span>
            </div>
          </div>
        ) : (
          <div className="bj-day-done bj-text-center">
            <p className="bj-h1">오늘의 발견 완료</p>
            <p className="bj-body bj-text-muted">
              오늘의 블라인드 책 {total}권을 모두 살펴봤어요.<br />
              서재에 담긴 책은 마이 탭에서 확인해보세요.
            </p>
            <button onClick={handleReset} className="bj-btn bj-btn--primary bj-btn--done">
              다시 보기
            </button>
          </div>
        )}
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next="/discover" />
    </main>
  )
}
