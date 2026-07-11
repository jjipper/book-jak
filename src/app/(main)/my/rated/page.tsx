'use client'

// 마이 > 보관함 — 내가 읽고 별점 준 책

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getBook } from '@/data/books'
import { getAuthor } from '@/data/authors'
import { loadBookRatings, type BookRatingRecord } from '@/lib/bookRatings'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import Stars from '@/components/rate/Stars'

export default function MyRatedPage() {
  const [ratings, setRatings] = useState<BookRatingRecord[]>([])

  useEffect(() => {
    setRatings(loadBookRatings().slice().sort((a, b) => b.ts - a.ts))
  }, [])

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">별점 준 책</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ratings.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 별점 준 책이 없어요</p>
            <Link href="/rate" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              읽은 책 평가하러 가기
            </Link>
          </div>
        ) : (
          ratings.map((r) => {
            const book = getBook(r.bookId)
            const title = book?.title ?? r.title ?? '제목 없음'
            const authorName = book ? getAuthor(book.authorId)?.name : undefined
            return (
              <Link key={r.bookId} href={`/rate/books/${r.bookId}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'stretch', gap: 14 }}>
                <div style={{ width: 52, flexShrink: 0 }}>
                  <IllustPlaceholder code={book?.illustCode ?? r.bookId} alt={title} aspectRatio="3 / 4" />
                </div>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                  <p className="bj-body" style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {title}
                  </p>
                  {authorName && <p className="bj-caption">{authorName}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Stars value={r.stars} size={12} />
                    <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>{r.stars}점</span>
                  </div>
                  {r.review && (
                    <p className="bj-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>&ldquo;{r.review}&rdquo;</p>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}
