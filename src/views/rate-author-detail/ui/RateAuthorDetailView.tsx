'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BOOKS } from '@/entities/book/model/books'
import { getAuthor } from '@/entities/author/model/authors'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import BookRow from '@/widgets/book/BookRow'

export default function RateAuthorDetailView() {
  const params = useParams<{ id: string }>()
  const author = getAuthor(params.id)
  const [myRatings, setMyRatings] = useState<BookRatingRecord[]>([])

  useEffect(() => {
    setMyRatings(loadBookRatings())
  }, [])

  if (!author) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-page-head">
            <Link href="/rate" className="bj-icon-btn">←</Link>
            <p className="bj-body" style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>작가를 찾을 수 없어요.</p>
          </div>
        </div>
      </main>
    )
  }

  const books = BOOKS.filter((b) => b.authorId === author.id).sort((a, b) => b.year - a.year)
  const avgOfAuthor = books.length
    ? Math.round((books.reduce((sum, b) => sum + b.avgRating, 0) / books.length) * 10) / 10
    : 0

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/rate" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">작가</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-card bj-card--flat" style={{ padding: 18 }}>
          <p className="bj-h1" style={{ fontSize: 20, marginBottom: 4 }}>{author.name}</p>
          <p className="bj-caption" style={{ marginBottom: 10 }}>{author.origin}</p>
          <p className="bj-body" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-muted)' }}>{author.bio}</p>
          <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
            <div>
              <p className="bj-caption">등록된 책</p>
              <p className="bj-body bj-bold">{books.length}권</p>
            </div>
            <div>
              <p className="bj-caption">평균 별점</p>
              <p className="bj-body bj-bold">★ {avgOfAuthor.toFixed(1)}</p>
            </div>
          </div>
        </div>

        <section>
          <p className="bj-section-label">
            작가의 책
            <span className="bj-section-label__line" />
          </p>
          <div className="bj-col-10" style={{ marginTop: 12 }}>
            {books.map((b) => (
              <BookRow key={b.id} book={b} myStars={myRatings.find((r) => r.bookId === b.id)?.stars} />
            ))}
          </div>
        </section>
      </div>
      </div>
    </main>
  )
}
