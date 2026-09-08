'use client'

// 카카오 검색 결과 한 줄 카드 — 표지는 카카오 썸네일 URL 사용
// 빈 별을 누르면 그 자리에서 바로 내 평점이 저장된다.

import { useState } from 'react'
import Link from 'next/link'
import type { ExternalBook } from '@/entities/external-book/model/externalBooks'
import { saveBookRating, removeBookRating } from '@/entities/book-rating/model/bookRatings'
import StarRating from '@/shared/ui/StarRating'

interface ExternalBookRowProps {
  book: ExternalBook
  myStars?: number
}

export default function ExternalBookRow({ book, myStars }: ExternalBookRowProps) {
  // 내 평가 이력은 마운트 후 localStorage에서 늦게 도착한다 — prop을 원본으로 두고
  // 이 행에서 직접 누른 값만 덮어쓴다 (effect로 동기화하면 렌더가 한 번 더 돈다)
  const [rated, setRated] = useState<number | null>(null)
  const stars = rated ?? myStars ?? 0

  function handleRate(n: number) {
    setRated(n)
    if (n === 0) removeBookRating(book.id)
    else saveBookRating({ bookId: book.id, title: book.title, stars: n, ts: Date.now() })
  }

  return (
    <Link href={`/rate/books/${book.id}`} className="bj-row bj-book-link bj-unstyled-link">
      <div className="bj-ext-book-cover">
        {book.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.thumbnail} alt={book.title} className="bj-cover-img" />
        )}
      </div>
      <div className="bj-book-row__body">
        <p className="bj-body bj-book-title-sm">
          {book.title}
        </p>
        <p className="bj-caption bj-truncate bj-caption--hint">
          {book.authors.join(', ') || '작자 미상'} · {book.publisher}{book.year ? ` · ${book.year}` : ''}
        </p>
        <div className="bj-book-row__meta-row">
          <StarRating value={stars} onChange={handleRate} size={16} />
          {stars > 0 && <span className="bj-caption bj-bold bj-caption--action">내 별점 {stars}점</span>}
        </div>
      </div>
    </Link>
  )
}
