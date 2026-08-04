'use client'

// 평가 탭 — 추천 서가·작가 저서 목록에서 쓰는 책 한 줄 카드
// 평균 별점 대신 빈 별을 두고, 누르면 그 자리에서 바로 내 평점이 저장된다.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Book } from '@/entities/book/model/books'
import { getAuthor } from '@/entities/author/model/authors'
import { saveBookRating, removeBookRating } from '@/entities/book-rating/model/bookRatings'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import StarRating from '@/shared/ui/StarRating'

interface BookRowProps {
  book: Book
  myStars?: number // 내가 평가한 별점 (없으면 미평가)
}

export default function BookRow({ book, myStars }: BookRowProps) {
  const authorName = getAuthor(book.authorId)?.name ?? '작자 미상'
  const [stars, setStars] = useState(myStars ?? 0)

  // 내 평가 이력은 마운트 후 localStorage에서 늦게 도착한다 — prop 갱신 시 동기화
  useEffect(() => {
    if (myStars !== undefined) setStars(myStars)
  }, [myStars])

  function handleRate(n: number) {
    setStars(n)
    if (n === 0) removeBookRating(book.id)
    else saveBookRating({ bookId: book.id, title: book.title, stars: n, ts: Date.now() })
  }

  return (
    <Link href={`/rate/books/${book.id}`} className="bj-row bj-book-link bj-unstyled-link">
      <div className="bj-book-thumb">
        <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 4" />
      </div>
      <div className="bj-book-row__body">
        <p className="bj-body bj-truncate bj-book-title-sm">
          {book.title}
        </p>
        <p className="bj-caption bj-caption--hint">{authorName} · {book.genre} · {book.year}</p>
        <div className="bj-book-row__meta-row">
          <StarRating value={stars} onChange={handleRate} size={16} />
          {stars > 0 && <span className="bj-caption bj-bold bj-caption--action">내 별점 {stars}점</span>}
        </div>
      </div>
    </Link>
  )
}
