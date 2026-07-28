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
      <main className="bj-shell" style={{ minHeight: '100dvh' }}>
        <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div style={{ padding: 'var(--space-lg) 0' }}>
            <Link href="/rate" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
            <p className="bj-body" style={{ marginTop: 24, color: 'var(--color-text-muted)' }}>책을 찾을 수 없어요.</p>
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
    <main className="bj-shell" style={{ minHeight: '100dvh' }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <Link href="/rate" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>책 정보</span>
      </header>

      <div style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* ① 책 기본 정보 */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ width: 104, flexShrink: 0 }}>
            <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 4" />
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <p className="bj-h1" style={{ fontSize: 22, lineHeight: 1.25 }}>{book.title}</p>
            <Link href={`/rate/authors/${book.authorId}`} className="bj-body" style={{ fontSize: 15, color: 'var(--color-action)', textDecoration: 'none', fontWeight: 700, marginTop: 6 }}>
              {author?.name ?? '작자 미상'} →
            </Link>
            <p className="bj-caption" style={{ marginTop: 2, color: 'var(--color-text-hint)' }}>{book.genre} · {book.year} · {book.pages}p</p>
          </div>
        </div>

        {/* ② 내 점수 + 내 평가 — 별 아이콘은 내 점수 전용, 예상·평균은 텍스트로 */}
        <div className="bj-card bj-card--flat" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'baseline' }}>
            <span className="bj-caption" style={{ fontWeight: 700 }}>
              예상 별점 <span style={{ color: 'var(--color-action)', fontSize: 17, fontWeight: 800 }}>★ {predicted ? predicted.score.toFixed(1) : '—'}</span>
            </span>
            <span className="bj-caption" style={{ fontWeight: 700 }}>
              평균 별점 <span style={{ color: 'var(--color-text)', fontSize: 17, fontWeight: 800 }}>★ {book.avgRating.toFixed(1)}</span> ({book.ratingCount.toLocaleString()}명)
            </span>
          </div>
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

        {/* ③ 책 줄거리 */}
        <section>
          <SectionLabel>줄거리</SectionLabel>
          <p className="bj-body" style={{ fontSize: 14, lineHeight: 1.7, marginTop: 12, color: 'var(--color-text-muted)' }}>
            {book.description}
          </p>
        </section>

        {/* ④ 작가 */}
        {author && (
          <section>
            <SectionLabel>작가</SectionLabel>
            <Link href={`/rate/authors/${author.id}`} className="bj-card bj-card--flat" style={{ display: 'block', textDecoration: 'none', color: 'inherit', marginTop: 12, padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <p className="bj-body" style={{ fontWeight: 700 }}>{author.name}</p>
                <span className="bj-caption" style={{ color: 'var(--color-action)', fontWeight: 700 }}>책 {authorBooks.length}권 →</span>
              </div>
              <p className="bj-caption" style={{ marginBottom: 6 }}>{author.origin}</p>
              <p className="bj-body" style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--color-text-muted)' }}>{author.bio}</p>
            </Link>
          </section>
        )}

        {/* ⑤ 장르 · 분위기 · 난이도 + 관련 키워드 */}
        <section>
          <SectionLabel>이런 책이에요</SectionLabel>
          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
              padding: '12px 0', marginTop: 12,
              borderTop: '1px dashed var(--color-border)', borderBottom: '1px dashed var(--color-border)',
            }}
          >
            {[
              { key: '장르', value: book.genre },
              { key: '분위기', value: book.mood },
              { key: '난이도', value: book.difficulty },
            ].map((m) => (
              <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>{m.key}</span>
                <span className="bj-body" style={{ fontSize: 13, fontWeight: 700 }}>{m.value}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {book.tags.map((t) => (
              <span key={t} className="bj-chip" style={{ fontSize: 11 }}>#{t}</span>
            ))}
          </div>
        </section>

        {/* ⑥ 사람들 리뷰 — 목업 + 서버(다른 사용자) + 내 리뷰(로컬) */}
        <section>
          <SectionLabel>리뷰 {reviews.length + otherRemoteReviews.length + (myRating?.review ? 1 : 0)}</SectionLabel>
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
            {otherRemoteReviews.map((r) => (
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
            {reviews.map((r, i) => {
              const person = MOCK_PEOPLE.find((p) => p.id === r.personId)
              return (
                <div key={i} className="bj-row" style={{ alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Stars value={r.stars} size={12} />
                      <span className="bj-caption" style={{ fontWeight: 700 }}>{person?.nickname ?? '익명'}</span>
                    </div>
                    <p className="bj-body" style={{ fontSize: 14 }}>{r.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ⑦ 비슷한 책 — 표지 기준 3열, 내 별점이 있으면 그것, 없으면 예상 별점 */}
        <section>
          <SectionLabel>이 책과 결이 비슷한 책</SectionLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
            {relatedBooks.map((b) => {
              const mine = allMyRatings.find((r) => r.bookId === b.id)?.stars
              const pred = relatedPredictions[b.id]
              return (
                <Link key={b.id} href={`/rate/books/${b.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IllustPlaceholder code={b.illustCode} alt={b.title} aspectRatio="3 / 4" />
                  <p className="bj-body" style={{ fontSize: 12, fontWeight: 700, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {b.title}
                  </p>
                  <p className="bj-caption" style={{ fontSize: 11 }}>{getAuthor(b.authorId)?.name ?? '작자 미상'}</p>
                  {mine !== undefined ? (
                    <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>내 별점 ★ {mine}</span>
                  ) : pred !== undefined ? (
                    <span className="bj-caption" style={{ fontWeight: 700 }}>예상 ★ {pred.toFixed(1)}</span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        </section>

        {/* ⑧ 별점 분포 — 맨 아래 */}
        <section>
          <SectionLabel>별점 분포</SectionLabel>
          <div className="bj-card bj-card--flat" style={{ display: 'flex', gap: 20, alignItems: 'center', padding: 16, marginTop: 12 }}>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <p className="bj-display" style={{ fontSize: 34, lineHeight: 1 }}>{book.avgRating.toFixed(1)}</p>
              <Stars value={book.avgRating} size={13} />
              <p className="bj-caption" style={{ marginTop: 4 }}>{book.ratingCount.toLocaleString()}명 평가</p>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[5, 4, 3, 2, 1].map((n) => {
                const pct = book.distribution[n - 1]
                return (
                  <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="bj-caption" style={{ width: 20, textAlign: 'right' }}>{n}★</span>
                    <div className="bj-progress__track" style={{ flex: 1 }}>
                      <div
                        className="bj-progress__fill"
                        style={{ width: `${pct}%`, opacity: pct === maxDist ? 1 : 0.45 }}
                      />
                    </div>
                    <span className="bj-caption" style={{ width: 32 }}>{pct}%</span>
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
