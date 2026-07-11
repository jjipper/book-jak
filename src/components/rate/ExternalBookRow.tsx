'use client'

// 카카오 검색 결과 한 줄 카드 — 표지는 카카오 썸네일 URL 사용
// 빈 별을 누르면 그 자리에서 바로 내 평점이 저장된다.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ExternalBook } from '@/lib/externalBooks'
import { saveBookRating, removeBookRating } from '@/lib/bookRatings'
import StarRating from '@/components/discover/StarRating'

interface ExternalBookRowProps {
  book: ExternalBook
  myStars?: number
}

export default function ExternalBookRow({ book, myStars }: ExternalBookRowProps) {
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
    <Link href={`/rate/books/${book.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'stretch', gap: 14 }}>
      <div className="bj-illust" style={{ width: 52, flexShrink: 0, aspectRatio: '3 / 4', background: 'var(--color-bg-sunken)' }}>
        {book.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
        <p className="bj-body" style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.title}
        </p>
        <p className="bj-caption" style={{ color: 'var(--color-text-hint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {book.authors.join(', ') || '작자 미상'} · {book.publisher}{book.year ? ` · ${book.year}` : ''}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <StarRating value={stars} onChange={handleRate} size={16} />
          {stars > 0 && <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>내 별점 {stars}점</span>}
        </div>
      </div>
    </Link>
  )
}
