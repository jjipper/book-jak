'use client'

// 알라딘 책 한 줄 카드 — 평가 탭 목록·검색 결과가 같이 쓴다.
// 빈 별을 누르면 그 자리에서 바로 내 평점이 저장된다 (로그인 필요).

import { useState } from 'react'
import Link from 'next/link'
import type { AladdinBook } from '@/entities/external-book/model/aladdinBooks'
import { getBookRating, saveBookRating, removeBookRating } from '@/entities/book-rating/model/bookRatings'
import { pushRating, deleteRating } from '@/entities/book-rating/api/ratingsRemote'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import StarRating from '@/shared/ui/StarRating'

interface ExternalBookRowProps {
  book: AladdinBook
  myStars?: number
  onRated?: (bookId: string, stars: number) => void
  next?: string // 로그인 후 돌아올 경로
}

export default function ExternalBookRow({ book, myStars, onRated, next = '/rate' }: ExternalBookRowProps) {
  // 내 평가 이력은 마운트 후 localStorage에서 늦게 도착한다 — prop을 원본으로 두고
  // 이 행에서 직접 누른 값만 덮어쓴다 (effect로 동기화하면 렌더가 한 번 더 돈다)
  const [rated, setRated] = useState<number | null>(null)
  const stars = rated ?? myStars ?? 0
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleRate(n: number) {
    requireAuth(() => {
      setRated(n)
      onRated?.(book.id, n)
      // 같은 별을 다시 누르면 0 — 평가 취소 (0점으로 저장하면 서버 check 제약에 걸린다)
      if (n === 0) {
        removeBookRating(book.id)
        deleteRating(book.id).catch(() => {})
        return
      }
      saveBookRating({ bookId: book.id, title: book.title, categoryName: book.categoryName, stars: n, review: getBookRating(book.id)?.review, ts: Date.now() })
      // 실패해도 로컬엔 남아 있고, 다음 syncMyRatings 때 다시 올라간다
      pushRating(
        { id: book.id, title: book.title, authors: [book.author], publisher: book.publisher, thumbnail: book.cover, categoryName: book.categoryName },
        n,
      ).catch(() => {})
    })
  }

  return (
    <div className="bj-row">
      {/* 표지·제목만 링크 — 별점은 링크 밖에 둬야 별을 눌렀을 때 상세로 튀지 않는다 */}
      <Link href={`/rate/books/${book.id}`} className="bj-ext-book-cover bj-unstyled-link">
        {book.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover} alt={book.title} className="bj-cover-img" />
        )}
      </Link>
      <div className="bj-book-row__body">
        <Link href={`/rate/books/${book.id}`} className="bj-unstyled-link">
          <p className="bj-body bj-book-title-sm">{book.title}</p>
          <p className="bj-caption bj-truncate bj-caption--hint">
            {[book.author, book.publisher].filter(Boolean).join(' · ')}
          </p>
        </Link>
        <div className="bj-book-row__meta-row">
          <StarRating value={stars} onChange={handleRate} size={20} />
          {stars > 0 && <span className="bj-caption bj-bold bj-caption--action">{stars}점 평가함</span>}
        </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={next} />
    </div>
  )
}
