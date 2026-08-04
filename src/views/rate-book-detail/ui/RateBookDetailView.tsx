'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getBook, getBookReviews, BOOKS } from '@/entities/book/model/books'
import { getAuthor } from '@/entities/author/model/authors'
import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { getBookRating, saveBookRating, removeBookRating, loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import { pushRating, fetchBookStats, type RemoteBookStats } from '@/entities/book-rating/api/ratingsRemote'
import { predictScore, type PredictedScore } from '@/features/predicted-score/model/predict'
import { getNickname } from '@/entities/user/model/profile'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import StarRating from '@/shared/ui/StarRating'
import Stars from '@/shared/ui/Stars'
import ExternalBookDetail from '@/widgets/book/ExternalBookDetail'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="bj-section-label">
      {children}
      <span className="bj-section-label__line" />
    </p>
  )
}

export default function RateBookDetailView() {
  const params = useParams<{ id: string }>()
  // 카카오 검색으로 찾은 책(isbn-...)과 카탈로그 책(b01...)을 분기
  if (params.id.startsWith('isbn-')) return <ExternalBookDetail bookId={params.id} />
  return <CatalogBookDetail id={params.id} />
}

function CatalogBookDetail({ id }: { id: string }) {
  const book = getBook(id)

  const [myRating, setMyRating] = useState<BookRatingRecord | undefined>(undefined)
  const [predicted, setPredicted] = useState<PredictedScore | null>(null)
  const [allMyRatings, setAllMyRatings] = useState<BookRatingRecord[]>([])
  const [relatedPredictions, setRelatedPredictions] = useState<Record<string, number>>({})
  const [stars, setStars] = useState(0)
  const [review, setReview] = useState('')
  const [justSaved, setJustSaved] = useState(false)
  const [stats, setStats] = useState<RemoteBookStats | null>(null)

  useEffect(() => {
    if (!book) return
    const mine = getBookRating(book.id)
    setMyRating(mine)
    setStars(mine?.stars ?? 0)
    setReview(mine?.review ?? '')
    setPredicted(predictScore(book))
    setAllMyRatings(loadBookRatings())

    // 비슷한 책들의 예상 별점 (내 평가가 없는 책에만 표시)
    const preds: Record<string, number> = {}
    for (const rid of book.relatedBookIds) {
      const rb = getBook(rid)
      if (!rb) continue
      const p = predictScore(rb)
      if (p) preds[rid] = p.score
    }
    setRelatedPredictions(preds)

    let cancelled = false
    fetchBookStats(book.id).then((s) => { if (!cancelled) setStats(s) })
    return () => { cancelled = true }
  }, [book])

  if (!book) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-page-head">
            <Link href="/rate" className="bj-icon-btn">←</Link>
            <p className="bj-body bj-mt-24 bj-text-muted">책을 찾을 수 없어요.</p>
          </div>
        </div>
      </main>
    )
  }

  const author = getAuthor(book.authorId)
  const authorBooks = BOOKS.filter((b) => b.authorId === book.authorId)
  const relatedBooks = book.relatedBookIds.map(getBook).filter((b): b is NonNullable<typeof b> => !!b)
  const reviews = getBookReviews(book.id)
  const otherRemoteReviews = (stats?.reviews ?? []).filter((r) => r.userId !== stats?.myUserId)
  const maxDist = Math.max(...book.distribution)

  // 별을 누르는 즉시 저장 — 같은 지점을 다시 누르면 취소, 리뷰는 아래 입력창에서 따로 저장
  function handleRate(n: number) {
    if (!book) return
    setStars(n)
    if (n === 0) {
      removeBookRating(book.id)
      setMyRating(undefined)
      return
    }
    persist(n, review)
  }

  function handleSaveReview() {
    if (!book || stars === 0) return
    persist(stars, review)
  }

  function persist(n: number, reviewText: string) {
    if (!book) return
    const record: BookRatingRecord = {
      bookId: book.id,
      title: book.title,
      stars: n,
      review: reviewText.trim() || undefined,
      ts: Date.now(),
    }
    saveBookRating(record)
    setMyRating(record)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)

    // 서버에도 동기화 (Supabase 미설정이면 no-op)
    const authorName = getAuthor(book.authorId)?.name
    pushRating(
      { id: book.id, title: book.title, authors: authorName ? [authorName] : [], year: book.year },
      n,
      reviewText,
    ).then(() => fetchBookStats(book.id)).then((s) => setStats(s))
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/rate" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg bj-truncate">책 정보</span>
      </header>

      <div className="bj-content--24">
        {/* ① 책 기본 정보 */}
        <div className="bj-book-head">
          <div className="bj-book-head__cover bj-book-head__cover--104">
            <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 4" />
          </div>
          <div className="bj-book-head__body">
            <p className="bj-h1 bj-h1--book">{book.title}</p>
            <Link href={`/rate/authors/${book.authorId}`} className="bj-body bj-book-author-link">
              {author?.name ?? '작자 미상'} →
            </Link>
            <p className="bj-caption bj-caption--meta">{book.genre} · {book.year} · {book.pages}p</p>
          </div>
        </div>

        {/* ② 내 점수 + 내 평가 — 별 아이콘은 내 점수 전용, 예상·평균은 텍스트로 */}
        <div className="bj-card bj-card--flat bj-col-10">
          <div className="bj-row-baseline-16">
            <span className="bj-caption bj-bold">
              예상 별점 <span className="bj-stat-star--action">★ {predicted ? predicted.score.toFixed(1) : '—'}</span>
            </span>
            <span className="bj-caption bj-bold">
              평균 별점 <span className="bj-stat-star">★ {book.avgRating.toFixed(1)}</span> ({book.ratingCount.toLocaleString()}명)
            </span>
          </div>
          <StarRating value={stars} onChange={handleRate} size={32} />
          <p className="bj-caption" style={{ color: stars > 0 ? 'var(--color-action)' : undefined }}>
            {stars > 0
              ? `내 별점 ${stars}점 · 같은 별을 다시 누르면 취소돼요${justSaved ? ' · 저장됐어요!' : ''}`
              : '별을 눌러 평가해보세요 (반 칸 = 0.5점)'}
          </p>
          {stars > 0 && (
            <div className="bj-row-8">
              <textarea
                className="bj-textarea bj-textarea--review"
                placeholder="한 줄 리뷰 남기기 (선택)"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSaveReview}
                className="bj-btn bj-btn--save"
              >
                저장
              </button>
            </div>
          )}
        </div>

        {/* ③ 책 줄거리 */}
        <section>
          <SectionLabel>줄거리</SectionLabel>
          <p className="bj-body bj-description bj-mt-12">
            {book.description}
          </p>
        </section>

        {/* ④ 작가 */}
        {author && (
          <section>
            <SectionLabel>작가</SectionLabel>
            <Link href={`/rate/authors/${author.id}`} className="bj-card bj-card--flat bj-unstyled-link bj-mt-12 bj-block">
              <div className="bj-row-between bj-mb-6">
                <p className="bj-body bj-bold">{author.name}</p>
                <span className="bj-caption bj-text-action-bold">책 {authorBooks.length}권 →</span>
              </div>
              <p className="bj-caption bj-mb-6">{author.origin}</p>
              <p className="bj-body bj-text-bio">{author.bio}</p>
            </Link>
          </section>
        )}

        {/* ⑤ 장르 · 분위기 · 난이도 + 관련 키워드 */}
        <section>
          <SectionLabel>이런 책이에요</SectionLabel>
          <div className="bj-meta-grid">
            {[
              { key: '장르', value: book.genre },
              { key: '분위기', value: book.mood },
              { key: '난이도', value: book.difficulty },
            ].map((m) => (
              <div key={m.key} className="bj-col-3">
                <span className="bj-caption bj-bold bj-caption--spaced">{m.key}</span>
                <span className="bj-body bj-text-13-bold">{m.value}</span>
              </div>
            ))}
          </div>
          <div className="bj-tag-group bj-mt-12">
            {book.tags.map((t) => (
              <span key={t} className="bj-chip bj-text-11">#{t}</span>
            ))}
          </div>
        </section>

        {/* ⑥ 사람들 리뷰 — 목업 + 서버(다른 사용자) + 내 리뷰(로컬) */}
        <section>
          <SectionLabel>리뷰 {reviews.length + otherRemoteReviews.length + (myRating?.review ? 1 : 0)}</SectionLabel>
          <div className="bj-col-10 bj-mt-12">
            {myRating?.review && (
              <div className="bj-row bj-row--top bj-row--review-me">
                <div className="bj-flex-1">
                  <div className="bj-review-meta">
                    <Stars value={myRating.stars} size={12} />
                    <span className="bj-caption bj-bold bj-text-action">{getNickname() ?? '나'} (내 리뷰)</span>
                  </div>
                  <p className="bj-body bj-body--sm">{myRating.review}</p>
                </div>
              </div>
            )}
            {otherRemoteReviews.map((r) => (
              <div key={r.userId + r.createdAt} className="bj-row bj-row--top">
                <div className="bj-flex-1">
                  <div className="bj-review-meta">
                    <Stars value={r.stars} size={12} />
                    <span className="bj-caption bj-bold">{r.nickname}</span>
                  </div>
                  <p className="bj-body bj-body--sm">{r.review}</p>
                </div>
              </div>
            ))}
            {reviews.map((r, i) => {
              const person = MOCK_PEOPLE.find((p) => p.id === r.personId)
              return (
                <div key={i} className="bj-row bj-row--top">
                  <div className="bj-flex-1">
                    <div className="bj-review-meta">
                      <Stars value={r.stars} size={12} />
                      <span className="bj-caption bj-bold">{person?.nickname ?? '익명'}</span>
                    </div>
                    <p className="bj-body bj-body--sm">{r.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ⑦ 비슷한 책 — 표지 기준 3열, 내 별점이 있으면 그것, 없으면 예상 별점 */}
        <section>
          <SectionLabel>이 책과 결이 비슷한 책</SectionLabel>
          <div className="bj-grid-3 bj-mt-12">
            {relatedBooks.map((b) => {
              const mine = allMyRatings.find((r) => r.bookId === b.id)?.stars
              const pred = relatedPredictions[b.id]
              return (
                <Link key={b.id} href={`/rate/books/${b.id}`} className="bj-related-book-link">
                  <IllustPlaceholder code={b.illustCode} alt={b.title} aspectRatio="3 / 4" />
                  <p className="bj-body bj-clamp-2 bj-text-book-title">
                    {b.title}
                  </p>
                  <p className="bj-caption bj-text-11">{getAuthor(b.authorId)?.name ?? '작자 미상'}</p>
                  {mine !== undefined ? (
                    <span className="bj-caption bj-bold bj-text-action">내 별점 ★ {mine}</span>
                  ) : pred !== undefined ? (
                    <span className="bj-caption bj-bold">예상 ★ {pred.toFixed(1)}</span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </section>

        {/* ⑧ 별점 분포 — 맨 아래 */}
        <section>
          <SectionLabel>별점 분포</SectionLabel>
          <div className="bj-card bj-card--flat bj-rating-dist">
            <div className="bj-text-center bj-shrink-0">
              <p className="bj-display bj-display--rating">{book.avgRating.toFixed(1)}</p>
              <Stars value={book.avgRating} size={13} />
              <p className="bj-caption bj-mt-4">{book.ratingCount.toLocaleString()}명 평가</p>
            </div>
            <div className="bj-flex-1 bj-col-10--gap4">
              {[5, 4, 3, 2, 1].map((n) => {
                const pct = book.distribution[n - 1]
                return (
                  <div key={n} className="bj-meta-row">
                    <span className="bj-caption bj-dist-star-label">{n}★</span>
                    <div className="bj-progress__track bj-flex-1">
                      <div
                        className="bj-progress__fill"
                        style={{ width: `${pct}%`, opacity: pct === maxDist ? 1 : 0.45 }}
                      />
                    </div>
                    <span className="bj-caption bj-dist-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>
      </div>
    </main>
  )
}
