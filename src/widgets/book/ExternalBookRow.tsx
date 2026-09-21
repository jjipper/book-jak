'use client'

// 카카오 검색 결과 한 줄 카드 — 표지는 카카오 썸네일 URL 사용
// 빈 별을 누르면 그 자리에서 바로 내 평점이 저장된다.

import { useState } from 'react'
import Link from 'next/link'
import type { ExternalBook } from '@/entities/external-book/model/externalBooks'
import { getBookRating, saveBookRating, removeBookRating } from '@/entities/book-rating/model/bookRatings'
import { pushRating, deleteRating } from '@/entities/book-rating/api/ratingsRemote'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
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
  const { showGate, closeGate, requireAuth } = useAuthGate()

  // 평가 탭(RateView.handleRate)과 같은 흐름 — 로그인 확인 후 로컬 저장 + 서버 push
  function handleRate(n: number) {
    requireAuth(() => {
      setRated(n)
      if (n === 0) {
        removeBookRating(book.id)
        deleteRating(book.id).catch(() => {})
        return
      }
      saveBookRating({ bookId: book.id, title: book.title, stars: n, review: getBookRating(book.id)?.review, ts: Date.now() })
      // 실패해도 로컬엔 남아 있고, 다음 syncMyRatings 때 다시 올라간다
      pushRating(
        { id: book.id, title: book.title, authors: book.authors, publisher: book.publisher, year: book.year, thumbnail: book.thumbnail },
        n,
      ).catch(() => {})
    })
  }

  return (
    <div className="bj-row bj-book-link">
      {/* 표지·제목만 링크 — 별점은 링크 밖에 둬야 별을 눌렀을 때 상세로 튀지 않는다 */}
      <Link href={`/rate/books/${book.id}`} className="bj-ext-book-cover bj-unstyled-link">
        {book.thumbnail && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.thumbnail} alt={book.title} className="bj-cover-img" />
        )}
      </Link>
      <div className="bj-book-row__body">
        <Link href={`/rate/books/${book.id}`} className="bj-unstyled-link">
          <p className="bj-body bj-book-title-sm">
            {book.title}
          </p>
          <p className="bj-caption bj-truncate bj-caption--hint">
            {book.authors.join(', ') || '작자 미상'} · {book.publisher}{book.year ? ` · ${book.year}` : ''}
          </p>
        </Link>
        <div className="bj-book-row__meta-row">
          <StarRating value={stars} onChange={handleRate} size={16} />
          {stars > 0 && <span className="bj-caption bj-bold bj-caption--action">내 별점 {stars}점</span>}
        </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next="/search" />
    </div>
  )
}
