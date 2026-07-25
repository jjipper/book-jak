'use client'

import { useEffect, useState } from 'react'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'
import { predictBlindMatch } from '@/features/predicted-score/model/predict'
import { saveBlindRating, loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import { Button } from '@/shared/ui'
import SectionHead from './SectionHead'
import { SparkleIcon, HeartIcon } from './icons'
import Link from 'next/link'

const RAIL_CLASS = 'bj-rail bj-rail--lg-grid-3'

/* 오늘의 발견 — 블라인드 카드 가로 레일.
   궁금해요 = discover와 동일한 saveBlindRating 레코드로 저장(취향 통계에 합산).
   넘어갈래요 = 홈에서만 당일 숨김(발견 탭 흐름은 건드리지 않음). */

const SKIP_KEY_PREFIX = 'book_home_skip:'

function loadSkipped(dateKey: string): number[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SKIP_KEY_PREFIX + dateKey)
    return raw ? (JSON.parse(raw) as number[]) : []
  } catch {
    return []
  }
}

/* 하트 수 데이터가 아직 없어 책·후기별로 고정되는 유사난수를 쓴다 */
function heartCountFor(bookId: number, idx: number): number {
  return 56 + ((bookId * 37 + idx * 53) % 180)
}

interface DiscoverRailProps {
  books: BlindBook[]
  dateKey: string
}

export default function DiscoverRail({ books, dateKey }: DiscoverRailProps) {
  const [matches, setMatches] = useState<Record<number, number>>({})
  const [curiousIds, setCuriousIds] = useState<Set<number>>(new Set())
  const [skippedIds, setSkippedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    const m: Record<number, number> = {}
    books.forEach((book) => {
      const match = predictBlindMatch(book)
      if (match) m[book.id] = match.percent
    })
    setMatches(m)
    setCuriousIds(new Set(loadBlindRatings().map((r) => r.bookId)))
    setSkippedIds(new Set(loadSkipped(dateKey)))
  }, [books, dateKey])

  const handleCurious = (book: BlindBook) => {
    if (curiousIds.has(book.id)) return
    saveBlindRating({
      bookId: book.id,
      title: book.title,
      stars: 4,
      tags: book.tags.map((t) => t.text),
      ts: Date.now(),
    })
    setCuriousIds((prev) => new Set(prev).add(book.id))
  }

  const handleSkip = (book: BlindBook) => {
    setSkippedIds((prev) => {
      const next = new Set(prev).add(book.id)
      localStorage.setItem(SKIP_KEY_PREFIX + dateKey, JSON.stringify([...next]))
      return next
    })
  }

  const visible = books.filter((b) => !skippedIds.has(b.id))

  return (
    <section className="bj-section">
      <SectionHead
        title="오늘의 발견"
        icon={<SparkleIcon size={18} />}
        cap={`블라인드로 만나는 오늘의 ${books.length}권`}
        moreHref="/discover"
      />
      {visible.length === 0 ? (
        <div className="bj-callout">
          오늘 카드는 전부 넘겼어요. 내일 새 책이 오고,{' '}
          <Link href="/discover" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
            발견 탭
          </Link>
          에는 지난 카드가 남아 있어요
        </div>
      ) : (
        <div className={RAIL_CLASS}>
          {visible.map((book) => {
            const curious = curiousIds.has(book.id)
            return (
              <article key={book.id} className="bj-discover-card">
                <div className="bj-discover-card__top">
                  <div className="bj-discover-card__cover">
                    <span className="bj-discover-card__q">?</span>
                  </div>
                  <div className="bj-discover-card__info">
                    <span className="bj-discover-card__ai">
                      <SparkleIcon />
                      AI가 골랐어요
                    </span>
                    <p className="bj-discover-card__desc bj-clamp-4" style={{ margin: 0 }}>{book.aiPitch}</p>
                    <div className="bj-discover-card__tags">
                      {book.tags.slice(0, 3).map((tag) => (
                        <span key={tag.text} className="bj-tag">#{tag.text}</span>
                      ))}
                    </div>
                    {matches[book.id] !== undefined && (
                      <p className="bj-discover-card__match" style={{ margin: 0 }}>
                        매칭도 {matches[book.id]}%
                      </p>
                    )}
                  </div>
                </div>
                <div className="bj-discover-card__reviews">
                  {book.hints.slice(0, 2).map((hint, i) => (
                    <div key={i} className="bj-discover-card__review">
                      <span className="bj-clamp-1">&ldquo;{hint}&rdquo;</span>
                      <span className="bj-discover-card__hearts">
                        <HeartIcon />
                        {heartCountFor(book.id, i)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="bj-discover-card__actions">
                  <Button
                    variant="primary"
                    className="bj-btn--pill"
                    style={{ flex: 1, fontSize: 'var(--fs-body-sm)' }}
                    disabled={curious}
                    onClick={() => handleCurious(book)}
                  >
                    {curious ? '담았어요' : '궁금해요'}
                  </Button>
                  <Button
                    variant="secondary"
                    className="bj-btn--pill"
                    style={{ flex: '0 0 42%', fontSize: 'var(--fs-body-sm)' }}
                    onClick={() => handleSkip(book)}
                  >
                    넘어갈래요
                  </Button>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
