'use client'

import { useEffect, useMemo, useState } from 'react'
import { saveBlindRating } from '@/entities/blind-rating/model/blindRatings'
import { addToWishlist } from '@/features/wishlist/model/wishlist'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { pickDailyBooks, dateKeyOf, BOOKS_PER_DAY, MAX_PAST_DAYS } from '@/entities/blind-book/model/dailyDiscover'
import BlindBookCard from '@/widgets/blind-book-card/BlindBookCard'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function dateOf(offset: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d
}

export default function DiscoverView() {
  // 날짜는 클라이언트에서만 알 수 있으므로 마운트 후 렌더 (SSR 불일치 방지)
  const [mounted, setMounted] = useState(false)
  const [dayOffset, setDayOffset] = useState(0) // 0 = 오늘, -1 = 어제 …
  const [currentIdx, setCurrentIdx] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [showBrowse, setShowBrowse] = useState(false)
  const [browseTag, setBrowseTag] = useState<string | null>(null)
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set())

  const allBrowseTags = useMemo(() => {
    const seen = new Set<string>()
    const tags: string[] = []
    BLIND_BOOKS.forEach((b) => b.tags.forEach((t) => {
      if (!seen.has(t.text)) { seen.add(t.text); tags.push(t.text) }
    }))
    return tags
  }, [])

  const browsedBooks = useMemo(
    () => browseTag ? BLIND_BOOKS.filter((b) => b.tags.some((t) => t.text === browseTag)) : BLIND_BOOKS,
    [browseTag],
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const date = dateOf(dayOffset)
  const books = mounted ? pickDailyBooks(dateKeyOf(date)) : []
  const total = BOOKS_PER_DAY
  const isDone = currentIdx >= total
  const book = books[currentIdx]
  const progressPct = Math.round((completedCount / total) * 100)

  const dayTitle = dayOffset === 0 ? '오늘의 발견' : dayOffset === -1 ? '어제의 발견' : `${date.getMonth() + 1}월 ${date.getDate()}일의 발견`
  const dayCaption = `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]}) · 매일 새로운 ${BOOKS_PER_DAY}권`

  function moveDay(delta: number) {
    const next = dayOffset + delta
    if (next > 0 || next < -MAX_PAST_DAYS) return
    setDayOffset(next)
    setCurrentIdx(0)
    setCompletedCount(0)
  }

  function goNext() {
    setCurrentIdx((i) => i + 1)
  }

  function handleSkip() {
    setCompletedCount((c) => c + 1)
    goNext()
  }

  // 궁금해요 = 긍정 취향 신호로 기록 (별점 4점 상당)
  function handleCurious() {
    if (!book) return
    saveBlindRating({
      bookId: book.id,
      title: book.title,
      stars: 4,
      tags: book.tags.map((t) => t.text),
      ts: Date.now(),
    })
    setCompletedCount((c) => c + 1)
  }

  function handleWish() {
    if (!book) return
    addToWishlist({
      bookId: `blind-${book.id}`,
      title: book.title,
      author: book.author,
      publisher: book.publisher,
      illustCode: book.illustCode,
      ts: Date.now(),
    })
  }

  function handleReset() {
    setCurrentIdx(0)
    setCompletedCount(0)
  }

  return (
    <main className="bj-shell bj-shell--col">
      <div className="bj-frame bj-frame--col">
      <header className="bj-subpage-head--between">
        <span className="bj-display bj-display--lg">발견</span>
        <button className="bj-icon-btn" onClick={() => setShowBrowse(true)} aria-label="블라인드 서가 둘러보기">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      {/* 날짜 네비게이션 — 다른 날의 발견 5권으로 이동 (카드 플로우와 같은 폭으로 중앙 정렬) */}
      <div className="bj-row-between bj-day-nav">
        <button
          type="button"
          onClick={() => moveDay(-1)}
          disabled={dayOffset <= -MAX_PAST_DAYS}
          className="bj-icon-btn"
          aria-label="이전 날짜"
          style={{ opacity: dayOffset <= -MAX_PAST_DAYS ? 0.3 : 1 }}
        >
          ←
        </button>
        <div className="bj-text-center">
          <p className="bj-h2 bj-h2--day">{mounted ? dayTitle : '오늘의 발견'}</p>
          <p className="bj-caption bj-mt-2">{mounted ? dayCaption : ' '}</p>
        </div>
        <button
          type="button"
          onClick={() => moveDay(1)}
          disabled={dayOffset >= 0}
          className="bj-icon-btn"
          aria-label="다음 날짜"
          style={{ opacity: dayOffset >= 0 ? 0.3 : 1 }}
        >
          →
        </button>
      </div>

      {!mounted ? (
        <div className="bj-flex-spacer" />
      ) : !isDone ? (
        <div className="bj-day-content">
          <div className="bj-progress-head">
            <div className="bj-row-between bj-mb-6">
              <span className="bj-caption">{completedCount} / {total} 완료</span>
              <span className="bj-caption bj-bold bj-text-action">{progressPct}%</span>
            </div>
            <div className="bj-progress__track">
              <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <BlindBookCard
            key={`${dayOffset}-${book.id}`}
            book={book}
            onSkip={handleSkip}
            onCurious={handleCurious}
            onWish={handleWish}
            onNext={goNext}
          />

          <div className="bj-hint-row">
            <span className="bj-caption">← 제 취향 아니에요</span>
            <span className="bj-caption">(공개 후) 넘어갈래요 →</span>
          </div>
        </div>
      ) : (
        <div className="bj-day-done bj-text-center">
          <p className="bj-h1">{dayTitle} 완료</p>
          <p className="bj-body bj-text-muted">
            {total}권의 블라인드 책을 모두 살펴봤어요.<br />
            어제의 발견으로 돌아가 더 탐색하거나, 내일 새로운 5권을 만나보세요.
          </p>
          <div className="bj-done-btns">
            <button onClick={() => moveDay(-1)} className="bj-btn bj-btn--done">
              ← 이전 날 보기
            </button>
            <button onClick={handleReset} className="bj-btn bj-btn--primary bj-btn--done">
              다시 보기
            </button>
          </div>
        </div>
      )}
      </div>

      {showBrowse && (
        <div className="bj-sheet__overlay" onClick={() => setShowBrowse(false)}>
          <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bj-row-between bj-mb-16">
              <p className="bj-h2">블라인드 서가</p>
              <button onClick={() => setShowBrowse(false)} className="bj-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="bj-row-wrap bj-mb-14">
              <button
                type="button"
                onClick={() => setBrowseTag(null)}
                className={`bj-chip${browseTag === null ? ' bj-chip--active' : ''}`}
              >
                전체
              </button>
              {allBrowseTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setBrowseTag((prev) => (prev === tag ? null : tag))}
                  className={`bj-chip${browseTag === tag ? ' bj-chip--active' : ''}`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <p className="bj-caption bj-mb-12">{browsedBooks.length}권</p>

            <div className="bj-col-12">
              {browsedBooks.map((book) => {
                const isRevealed = revealedIds.has(book.id)
                return (
                  <div key={book.id} className="bj-card--flat bj-card--p14">
                    <div className="bj-tag-group bj-mb-8">
                      {book.tags.map((tag) => (
                        <span key={tag.text} className={tag.kind === 'primary' ? 'bj-chip bj-chip--active' : 'bj-chip'}>
                          {tag.text}
                        </span>
                      ))}
                    </div>

                    <p className="bj-body bj-browse-desc">
                      {book.desc.map((seg, i) => (
                        <span key={i} style={seg.emphasis ? { color: 'var(--color-action)', fontWeight: 700 } : undefined}>
                          {seg.text}
                        </span>
                      ))}
                    </p>

                    <div className="bj-browse-meta">
                      {book.meta.map((m) => (
                        <span key={m.key} className="bj-caption">
                          <span className="bj-bold">{m.key}</span> {m.value}
                        </span>
                      ))}
                    </div>

                    {isRevealed ? (
                      <div className="bj-reveal-row">
                        <div className="bj-reveal-cover">
                          <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 4" />
                        </div>
                        <div className="bj-flex-1">
                          <p className="bj-body bj-bold bj-body--sm">{book.title}</p>
                          <p className="bj-caption">{book.author} · {book.publisher}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToWishlist({ bookId: `blind-${book.id}`, title: book.title, author: book.author, publisher: book.publisher, illustCode: book.illustCode, ts: Date.now() })}
                          className="bj-btn bj-btn--wish"
                        >
                          읽고싶어요
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setRevealedIds((prev) => new Set([...prev, book.id]))
                          saveBlindRating({ bookId: book.id, title: book.title, stars: 4, tags: book.tags.map((t) => t.text), ts: Date.now() })
                        }}
                        className="bj-btn bj-btn--primary bj-btn--block bj-btn--reveal"
                      >
                        궁금해요 → 제목·표지 공개
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
