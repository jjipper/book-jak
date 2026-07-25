'use client'

// 카카오 검색으로 찾은 책의 상세 화면 (bookId = 'isbn-{ISBN13}')
// 메타데이터는 카카오에서 실시간 조회, 평가·리뷰는 localStorage(내 것)만 존재.
// 별점 분포·예상 점수·연관 책은 서비스 평가 데이터가 쌓여야 가능해서 안내만 표시.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { lookupExternalBook, type ExternalBook } from '@/entities/external-book/model/externalBooks'
import { getBookRating, saveBookRating, removeBookRating, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import { pushRating, fetchBookStats, type RemoteBookStats } from '@/entities/book-rating/api/ratingsRemote'
import { getNickname } from '@/entities/user/model/profile'
import StarRating from '@/shared/ui/StarRating'
import Stars from '@/shared/ui/Stars'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="bj-section-label">
      {children}
      <span className="bj-section-label__line" />
    </p>
  )
}

interface ExternalBookDetailProps {
  bookId: string // 'isbn-{ISBN13}'
}

export default function ExternalBookDetail({ bookId }: ExternalBookDetailProps) {
  const isbn = bookId.replace(/^isbn-/, '')
  const [book, setBook] = useState<ExternalBook | null>(null)
  const [loading, setLoading] = useState(true)
  const [myRating, setMyRating] = useState<BookRatingRecord | undefined>(undefined)
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [stats, setStats] = useState<RemoteBookStats | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    lookupExternalBook(isbn)
      .then((b) => { if (!cancelled) setBook(b) })
      .catch(() => { if (!cancelled) setBook(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    fetchBookStats(bookId).then((s) => { if (!cancelled) setStats(s) })

    const mine = getBookRating(bookId)
    setMyRating(mine)
    setStars(mine?.stars ?? 0)
    setReview(mine?.review ?? '')
    return () => { cancelled = true }
  }, [isbn, bookId])

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', padding: '52px 20px' }}>
        <Link href="/rate" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <p className="bj-caption" style={{ textAlign: 'center', marginTop: 60 }}>책 정보를 불러오는 중…</p>
      </main>
    )
  }

  if (!book) {
    return (
      <main style={{ minHeight: '100dvh', padding: '52px 20px' }}>
        <Link href="/rate" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <p className="bj-body" style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>책 정보를 불러올 수 없어요.</p>
      </main>
    )
  }

  // 별을 누르는 즉시 저장 — 같은 지점을 다시 누르면 취소, 리뷰는 아래 입력창에서 따로 저장
  function handleRate(n: number) {
    setStars(n)
    if (n === 0) {
      removeBookRating(bookId)
      setMyRating(undefined)
      return
    }
    persist(n, review)
  }

  function handleSaveReview() {
    if (stars === 0) return
    persist(stars, review)
  }

  function persist(n: number, reviewText: string) {
    if (!book) return
    const record: BookRatingRecord = {
      bookId,
      title: book.title,
      stars: n,
      review: reviewText.trim() || undefined,
      ts: Date.now(),
    }
    saveBookRating(record)
    setMyRating(record)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)

    // 서버에도 동기화 후 커뮤니티 통계 갱신 (Supabase 미설정이면 no-op)
    pushRating(
      { id: bookId, title: book.title, authors: book.authors, publisher: book.publisher, year: book.year, thumbnail: book.thumbnail },
      n,
      reviewText,
    ).then(() => fetchBookStats(bookId)).then((s) => setStats(s))
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/rate" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">책 정보</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* 책 기본 정보 */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div className="bj-illust" style={{ width: 104, flexShrink: 0, aspectRatio: '3 / 4', background: 'var(--color-bg-sunken)' }}>
            {book.thumbnail && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.thumbnail} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p className="bj-h1" style={{ fontSize: 22, lineHeight: 1.25 }}>{book.title}</p>
            <p className="bj-body" style={{ fontSize: 15, fontWeight: 700, marginTop: 6 }}>{book.authors.join(', ') || '작자 미상'}</p>
            <p className="bj-caption" style={{ marginTop: 2, color: 'var(--color-text-hint)' }}>{book.publisher}{book.year ? ` · ${book.year}` : ''} · ISBN {book.isbn}</p>
          </div>
        </div>

        {/* 내 점수 + 내 평가 — 별 아이콘은 내 점수 전용, 평균은 텍스트로 */}
        <div className="bj-card bj-card--flat" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="bj-caption" style={{ fontWeight: 700 }}>
            {stats && stats.count > 0
              ? <>평균 별점 <span style={{ color: 'var(--color-text)', fontSize: 17, fontWeight: 800 }}>★ {stats.avg.toFixed(1)}</span> (북작 {stats.count}명)</>
              : '아직 이 책을 평가한 북작 사용자가 없어요'}
          </span>
          <StarRating value={stars} onChange={handleRate} size={32} />
          <p className="bj-caption" style={{ color: stars > 0 ? 'var(--color-action)' : undefined }}>
            {stars > 0
              ? `내 별점 ${stars}점 · 같은 별을 다시 누르면 취소돼요${justSaved ? ' · 저장됐어요!' : ''}`
              : '별을 눌러 평가해보세요 (반 칸 = 0.5점)'}
          </p>
          {stars > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                className="bj-textarea"
                placeholder="한 줄 리뷰 남기기 (선택)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
                style={{ minHeight: 44, flex: 1 }}
              />
              <button
                type="button"
                onClick={handleSaveReview}
                className="bj-btn"
                style={{ padding: '0 16px', fontSize: 13, cursor: 'pointer', flexShrink: 0 }}
              >
                저장
              </button>
            </div>
          )}
        </div>

        {/* 책 소개 */}
        {book.description && (
          <section>
            <SectionLabel>책 소개</SectionLabel>
            <p className="bj-body" style={{ fontSize: 14, lineHeight: 1.7, marginTop: 12, color: 'var(--color-text-muted)' }}>
              {book.description}
            </p>
            <a href={book.url} target="_blank" rel="noreferrer" className="bj-caption" style={{ display: 'inline-block', marginTop: 8, color: 'var(--color-action)', fontWeight: 700, textDecoration: 'none' }}>
              다음 책 정보에서 전체 소개 보기 →
            </a>
          </section>
        )}

        {/* 리뷰 — 내 리뷰(로컬) + 다른 사용자 리뷰(서버) */}
        {(() => {
          const otherReviews = (stats?.reviews ?? []).filter((r) => r.userId !== stats?.myUserId)
          const total = otherReviews.length + (myRating?.review ? 1 : 0)
          return (
            <section>
              <SectionLabel>리뷰 {total}</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {myRating?.review && (
                  <div className="bj-row" style={{ alignItems: 'flex-start', borderColor: 'var(--color-action)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Stars value={myRating.stars} size={12} />
                        <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>{getNickname() ?? '나'} (내 리뷰)</span>
                      </div>
                      <p className="bj-body" style={{ fontSize: 14 }}>{myRating.review}</p>
                    </div>
                  </div>
                )}
                {otherReviews.map((r) => (
                  <div key={r.userId + r.createdAt} className="bj-row" style={{ alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Stars value={r.stars} size={12} />
                        <span className="bj-caption" style={{ fontWeight: 700 }}>{r.nickname}</span>
                      </div>
                      <p className="bj-body" style={{ fontSize: 14 }}>{r.review}</p>
                    </div>
                  </div>
                ))}
                {total === 0 && (
                  <p className="bj-caption" style={{ padding: '16px 0', textAlign: 'center' }}>
                    아직 리뷰가 없어요. 이 책의 첫 리뷰를 남겨보세요!
                  </p>
                )}
              </div>
            </section>
          )
        })()}

        {/* 별점 분포 — 맨 아래 */}
        {stats && stats.count > 0 && (
          <section>
            <SectionLabel>별점 분포</SectionLabel>
            <div className="bj-card bj-card--flat" style={{ display: 'flex', gap: 20, alignItems: 'center', padding: 16, marginTop: 12 }}>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <p className="bj-display" style={{ fontSize: 34, lineHeight: 1 }}>{stats.avg.toFixed(1)}</p>
                <Stars value={stats.avg} size={13} />
                <p className="bj-caption" style={{ marginTop: 4 }}>북작 {stats.count}명 평가</p>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[5, 4, 3, 2, 1].map((n) => {
                  const pct = stats.distribution[n - 1]
                  const maxDist = Math.max(...stats.distribution)
                  return (
                    <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="bj-caption" style={{ width: 20, textAlign: 'right' }}>{n}★</span>
                      <div className="bj-progress__track" style={{ flex: 1 }}>
                        <div className="bj-progress__fill" style={{ width: `${pct}%`, opacity: pct === maxDist ? 1 : 0.45 }} />
                      </div>
                      <span className="bj-caption" style={{ width: 32 }}>{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
