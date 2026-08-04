'use client'

// 마이 > 보관함 — 내가 읽고 별점 준 책

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBook } from '@/entities/book/model/books'
import { getAuthor } from '@/entities/author/model/authors'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import Stars from '@/shared/ui/Stars'

export default function MyRatedView() {
  const [ratings, setRatings] = useState<BookRatingRecord[]>([])

  useEffect(() => {
    setRatings(loadBookRatings().slice().sort((a, b) => b.ts - a.ts))
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">별점 준 책</span>
      </header>

      <div className="bj-content">
        {ratings.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 별점 준 책이 없어요</p>
            <Link href="/rate" className="bj-btn bj-btn--primary bj-btn--cta">
              읽은 책 평가하러 가기
            </Link>
          </div>
        ) : (
          ratings.map((r) => {
            const book = getBook(r.bookId)
            const title = book?.title ?? r.title ?? '제목 없음'
            const authorName = book ? getAuthor(book.authorId)?.name : undefined
            return (
              <Link key={r.bookId} href={`/rate/books/${r.bookId}`} className="bj-row bj-book-link">
                <div className="bj-book-cover">
                  <IllustPlaceholder code={book?.illustCode ?? r.bookId} alt={title} aspectRatio="3 / 4" />
                </div>
                <div className="bj-book-info bj-flex-1">
                  <p className="bj-body bj-bold bj-truncate bj-body--sm">
                    {title}
                  </p>
                  {authorName && <p className="bj-caption">{authorName}</p>}
                  <div className="bj-meta-row">
                    <Stars value={r.stars} size={12} />
                    <span className="bj-caption bj-bold bj-caption--action">{r.stars}점</span>
                  </div>
                  {r.review && (
                    <p className="bj-caption bj-truncate">&ldquo;{r.review}&rdquo;</p>
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
