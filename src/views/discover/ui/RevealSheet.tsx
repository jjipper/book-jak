'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { RevealedBook } from '@/entities/blind-book/model/blindBooks'
import { fetchBookStats } from '@/entities/book-rating/api/ratingsRemote'
import Sheet from '@/shared/ui/Sheet'
import Stars from '@/shared/ui/Stars'

interface RevealSheetProps {
  book: RevealedBook | null
  onClose: () => void
  onSave: () => void
  onNext: () => void
}

export default function RevealSheet({ book, onClose, onSave, onNext }: RevealSheetProps) {
  const [stats, setStats] = useState<{ isbn: string; avg: number; count: number } | null>(null)
  const isbn = book?.isbn13

  useEffect(() => {
    if (!isbn) return
    fetchBookStats(`isbn-${isbn}`).then((s) => {
      if (s && s.count > 0) setStats({ isbn, avg: s.avg, count: s.count })
    })
  }, [isbn])

  if (!book) return null
  const rating = stats?.isbn === book.isbn13 ? stats : null

  return (
    <Sheet open onClose={onClose}>
      <div className="bj-reveal">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {book.cover && <img src={book.cover} alt="" className="bj-reveal__cover" />}
        <div className="bj-col-4">
          <p className="bj-h2">{book.title}</p>
          <p className="bj-caption">{book.author}</p>
        </div>
      </div>

      {/* 줄거리 + 북작 평점 — 최소 1줄, 최대 5줄 */}
      <div className="bj-reveal__summary">
        {rating && (
          <p className="bj-row-8">
            <Stars value={rating.avg} />
            <span className="bj-caption">북작 평균 {rating.avg} · {rating.count}명 평가</span>
          </p>
        )}
        <p className={`bj-body bj-reveal__desc${rating ? ' bj-reveal__desc--short' : ''}`}>{book.description}</p>
      </div>

      <div className="bj-col-8">
        <Link href={`/rate/books/isbn-${book.isbn13}`} className="bj-btn bj-btn--primary bj-btn--block">
          책 정보 바로가기
        </Link>
        <button type="button" onClick={onSave} className="bj-btn bj-btn--secondary bj-btn--block">
          서재에 담아두기
        </button>
        <button type="button" onClick={onNext} className="bj-btn bj-btn--text bj-btn--block">
          다음 블라인드 보기
        </button>
      </div>
    </Sheet>
  )
}
