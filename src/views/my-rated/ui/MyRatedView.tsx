'use client'

// 마이 > 보관함 — 내가 읽고 별점 준 책

import { useMemo } from 'react'
import Link from 'next/link'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import { SubpageHead } from '@/shared/ui'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import Stars from '@/shared/ui/Stars'
import { useMounted } from '@/shared/lib/useMounted'
import '@/widgets/book/BookRow.css'

export default function MyRatedView() {
  const mounted = useMounted()
  const ratings: BookRatingRecord[] = useMemo(
    () => (mounted ? loadBookRatings().slice().sort((a, b) => b.ts - a.ts) : []),
    [mounted],
  )

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <SubpageHead title="별점 준 책" backHref="/my" />

      <div className="bj-content">
        {!mounted ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : ratings.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 별점 준 책이 없어요</p>
            <Link href="/rate" className="bj-btn bj-btn--primary bj-btn--cta">
              읽은 책 평가하러 가기
            </Link>
          </div>
        ) : (
          ratings.map((r) => {
            const title = r.title ?? '제목 없음'
            return (
              <Link key={r.bookId} href={`/rate/books/${r.bookId}`} className="bj-book-row bj-unstyled-link">
                <div className="bj-book-row__cover">
                  <IllustPlaceholder code={r.bookId} alt={title} aspectRatio="60 / 76" />
                </div>
                <div className="bj-book-row__body">
                  <p className="bj-book-row__title">{title}</p>
                  <div className="bj-book-row__meta-row">
                    <Stars value={r.stars} size={16} />
                    <span className="bj-book-row__score">{r.stars}점</span>
                  </div>
                  {r.review && (
                    <p className="bj-book-row__author">&ldquo;{r.review}&rdquo;</p>
                  )}
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
