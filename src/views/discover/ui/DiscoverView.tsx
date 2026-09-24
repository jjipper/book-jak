'use client'

import { useEffect, useState } from 'react'
import { addToWishlist } from '@/features/wishlist/model/wishlist'
import type { BlindBook, RevealedBook } from '@/entities/blind-book/model/blindBooks'
import { fetchTodayBlind, recordBlind, revealBlind, type TodayBlind } from '@/entities/blind-book/api/blindRemote'
import { fetchTokenBalance } from '@/entities/token/api/tokenRemote'
import { TOKENS_CHANGED } from '@/entities/token/model/token'
import BlindBookCard from '@/widgets/blind-book-card/BlindBookCard'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import RevealSheet from './RevealSheet'
import './DiscoverView.css'

// 다시 보기(review) 중이면 전부, 아니면 아직 안 본 책만 순서대로
function nextIndex(books: BlindBook[], from: number, review: boolean): number {
  const i = books.findIndex((b, j) => j > from && (review || b.status === 'new'))
  return i === -1 ? books.length : i
}

export default function DiscoverView() {
  const [today, setToday] = useState<TodayBlind | null>(null)
  const [failed, setFailed] = useState(false)
  const [idx, setIdx] = useState(0)
  const [review, setReview] = useState(false)
  const [tokens, setTokens] = useState<number | null>(null)
  const [sheetBook, setSheetBook] = useState<RevealedBook | null>(null)
  const [busy, setBusy] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function load() {
    fetchTodayBlind().then((d) => {
      setFailed(!d)
      if (!d) return
      setToday(d)
      setReview(false)
      setIdx(nextIndex(d.books, -1, false))
    })
  }

  useEffect(() => {
    load()
    const loadTokens = () => { fetchTokenBalance().then(setTokens) }
    loadTokens()
    window.addEventListener(TOKENS_CHANGED, loadTokens)
    return () => window.removeEventListener(TOKENS_CHANGED, loadTokens)
  }, [])

  const books = today?.books ?? []
  const book = books[idx]
  const doneCount = books.filter((b) => b.status !== 'new').length
  const progressPct = books.length ? Math.round((doneCount / books.length) * 100) : 0

  function markStatus(index: number, patch: Partial<BlindBook>) {
    setToday((t) => t && { ...t, books: t.books.map((b) => (b.index === index ? { ...b, ...patch } : b)) })
  }

  function goNext() {
    setSheetBook(null)
    setIdx((i) => nextIndex(books, i, review))
  }

  function handlePass() {
    if (!today || !book) return
    if (book.status === 'new') {
      recordBlind(today.date, book.index, 'pass') // 비로그인이면 서버가 401 — 진행도만 저장 안 된다
      markStatus(book.index, { status: 'passed' })
    }
    goNext()
  }

  function handleReveal() {
    if (!today || !book || busy) return
    if (book.book) return setSheetBook(book.book) // 이미 공개한 책 — 무료
    requireAuth(async () => {
      setBusy(true)
      const res = await revealBlind(today.date, book.index)
      setBusy(false)
      if (res.ok && res.book) {
        if (typeof res.balance === 'number') setTokens(res.balance)
        markStatus(book.index, { status: 'revealed', book: res.book })
        setSheetBook(res.book)
      } else if (!res.ok && res.error === 'NO_TOKEN') {
        setTokens(0)
      } else if (!res.ok && res.error === 'STALE') {
        toast.show('날짜가 바뀌어서 오늘의 블라인드 북을 새로 불러와요')
        load()
      } else {
        toast.error('공개하지 못했어요. 잠시 후 다시 시도해주세요')
      }
    })
  }

  function handleSave() {
    if (!today || !book || !sheetBook) return
    const b = sheetBook
    requireAuth(() => {
      addToWishlist({
        bookId: `isbn-${b.isbn13}`,
        title: b.title,
        author: b.author,
        publisher: b.publisher,
        cover: b.cover,
        ts: Date.now(),
      })
      recordBlind(today.date, book.index, 'save')
      toast.show('서재에 담았어요')
    })
  }

  return (
    <main className="bj-shell bj-shell--col bj-discover">
      <div className="bj-frame bj-frame--col">
        <header className="bj-page-head bj-row-between">
          <div>
            <span className="bj-display bj-display--lg">발견</span>
            <p className="bj-caption">
              오늘은 {today?.theme ?? '…'} · 블라인드 북 {books.length || 5}권
            </p>
          </div>
          {tokens !== null && <span className="bj-discover__tokens">토큰 {tokens}</span>}
        </header>

        {failed ? (
          <div className="bj-day-done bj-text-center">
            <p className="bj-body bj-text-muted">오늘의 블라인드 북을 불러오지 못했어요</p>
            <button type="button" onClick={() => { setFailed(false); load() }} className="bj-btn bj-btn--primary bj-btn--done">
              다시 시도
            </button>
          </div>
        ) : !today ? (
          <div className="bj-flex-spacer" />
        ) : book ? (
          <div className="bj-discover__stage">
            <div className="bj-progress-head">
              <div className="bj-row-between bj-mb-6">
                <span className="bj-caption">{doneCount} / {books.length}</span>
                <span className="bj-caption bj-bold bj-text-action">{progressPct}%</span>
              </div>
              <div className="bj-progress__track">
                <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <BlindBookCard
              key={`${today.date}-${book.index}-${review}`}
              book={book}
              tokens={tokens}
              onPass={handlePass}
              onReveal={handleReveal}
            />
          </div>
        ) : (
          <div className="bj-day-done bj-text-center">
            <p className="bj-h1">오늘의 발견 완료</p>
            <p className="bj-body bj-text-muted">
              오늘의 블라인드 북 {books.length}권을 모두 살펴봤어요.<br />
              내일 새 블라인드 북이 찾아와요.
            </p>
            <button
              type="button"
              onClick={() => { setReview(true); setIdx(0) }}
              className="bj-btn bj-btn--primary bj-btn--done"
            >
              다시 보기
            </button>
          </div>
        )}
      </div>

      <RevealSheet book={sheetBook} onClose={() => setSheetBook(null)} onSave={handleSave} onNext={goNext} />
      <LoginGateSheet open={showGate} onClose={closeGate} next="/discover" />
    </main>
  )
}
