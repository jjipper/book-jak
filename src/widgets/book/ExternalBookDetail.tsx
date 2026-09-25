'use client'

// 책 상세 화면 (bookId = 'isbn-{ISBN13}')
// 메타데이터는 알라딘 ItemLookUp에서 실시간 조회, 별점·리뷰·서재 통계는 Supabase.

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { aladdinProductHref, lookupAladdinBook, type AladdinBook } from '@/entities/external-book/model/aladdinBooks'
import { getBookRating, saveBookRating, removeBookRating, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import {
  pushRating,
  deleteRating,
  fetchBookStats,
  fetchBookDetailStats,
  type BookDetailExtraStats,
  type RemoteBookStats,
} from '@/entities/book-rating/api/ratingsRemote'
import { addToWishlist, loadWishlist, removeFromWishlist } from '@/features/wishlist/model/wishlist'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getNickname } from '@/entities/user/model/profile'
import { formatRelTime } from '@/entities/post/model/relTime'
import { toast } from '@/shared/lib/toast'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import StarRating from '@/shared/ui/StarRating'
import Stars from '@/shared/ui/Stars'
import { useMounted } from '@/shared/lib/useMounted'
import Icon from '@/shared/ui/Icon'
import AladinLogo from './AladinLogo'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="bj-section-label">
      {children}
    </p>
  )
}

// 들어온 화면으로 돌아간다 — 링크로 바로 열린 탭(히스토리 없음)이면 평가 탭으로
function BackButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      className="bj-icon-btn"
      aria-label="뒤로"
      onClick={() => (window.history.length > 1 ? router.back() : router.push('/rate'))}
    >
      <Icon name="chevron-left" size={24} />
    </button>
  )
}

const DESC_FOLD_AT = 120 // 이보다 긴 책 소개는 접어서 보여준다

interface ExternalBookDetailProps {
  bookId: string // 'isbn-{ISBN13}'
}

export default function ExternalBookDetail({ bookId }: ExternalBookDetailProps) {
  const isbn = bookId.replace(/^isbn-/, '')
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const [book, setBook] = useState<AladdinBook | null>(null)
  const [loading, setLoading] = useState(true)
  // 내 평가는 localStorage라 마운트 후에만 읽고, 이 화면에서 고친 것만 덮어쓴다 (null = 아직 안 고침)
  const mounted = useMounted()
  const stored = useMemo(() => (mounted ? getBookRating(bookId) : undefined), [mounted, bookId])
  const [ratingEdit, setRatingEdit] = useState<BookRatingRecord | undefined | null>(null)
  const [starsEdit, setStarsEdit] = useState<number | null>(null)
  const [reviewEdit, setReviewEdit] = useState<string | null>(null)
  const myRating = ratingEdit === null ? stored : ratingEdit
  const stars = starsEdit ?? stored?.stars ?? 0
  const review = reviewEdit ?? stored?.review ?? ''
  const [justSaved, setJustSaved] = useState(false)
  const [stats, setStats] = useState<RemoteBookStats | null>(null)
  const [extra, setExtra] = useState<BookDetailExtraStats | null>(null)
  const [typeCode, setTypeCode] = useState<string | null>(null)
  const [descOpen, setDescOpen] = useState(false)
  // 서재 — 로컬 사본이 원본, 이 화면에서 누른 것만 덮어쓴다 (null = 아직 안 누름)
  const storedWished = useMemo(() => mounted && loadWishlist().some((r) => r.bookId === bookId), [mounted, bookId])
  const [wishEdit, setWishEdit] = useState<boolean | null>(null)
  const wished = wishEdit ?? storedWished

  // bookId가 바뀌면 호출부에서 key로 새로 마운트하므로 여기서 loading을 되돌릴 필요가 없다
  useEffect(() => {
    let cancelled = false
    lookupAladdinBook(isbn)
      .then((b) => { if (!cancelled) setBook(b) })
      .catch(() => { if (!cancelled) setBook(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    fetchBookStats(bookId).then((s) => { if (!cancelled) setStats(s) })
    const code = loadResult()?.typeCode ?? null
    fetchBookDetailStats(bookId, code).then((s) => {
      if (cancelled) return
      setExtra(s)
      setTypeCode(code)
    })
    return () => { cancelled = true }
  }, [isbn, bookId])

  if (loading) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <header className="bj-subpage-head">
            <BackButton />
            <span className="bj-h2">책 정보</span>
          </header>
          <p className="bj-caption bj-text-muted">책 정보를 불러오는 중…</p>
        </div>
      </main>
    )
  }

  if (!book) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <header className="bj-subpage-head">
            <BackButton />
            <span className="bj-h2">책 정보</span>
          </header>
          <p className="bj-body bj-text-muted">책 정보를 불러올 수 없어요.</p>
        </div>
      </main>
    )
  }

  // 별을 누르는 즉시 저장 — 같은 지점을 다시 누르면 취소, 리뷰는 아래 입력창에서 따로 저장
  function handleRate(n: number) {
    requireAuth(() => {
      setStarsEdit(n)
      if (n === 0) {
        removeBookRating(bookId)
        // 서버에서도 지워야 다음 동기화 때 되살아나지 않는다
        deleteRating(bookId).catch(() => {})
        setRatingEdit(undefined)
        return
      }
      persist(n, review)
    })
  }

  function handleSaveReview() {
    if (stars === 0) return
    persist(stars, review)
  }

  function handleWish() {
    requireAuth(() => {
      if (!book) return
      if (wished) {
        removeFromWishlist(bookId)
        setWishEdit(false)
        return
      }
      addToWishlist({ bookId, title: book.title, author: book.author, publisher: book.publisher, cover: book.cover, ts: Date.now() })
      setWishEdit(true)
      toast.show('서재에 담았어요')
    })
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
    saveBookRating({ ...record, categoryName: book.categoryName })
    setRatingEdit(record)
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)

    // 서버에도 동기화 후 커뮤니티 통계 갱신 (Supabase 미설정이면 no-op)
    pushRating(
      { id: bookId, title: book.title, authors: [book.author], publisher: book.publisher, thumbnail: book.cover, categoryName: book.categoryName },
      n,
      reviewText,
    )
      .then(() => fetchBookStats(bookId))
      .then((s) => setStats(s))
      .catch(() => toast.error('이 기기에만 저장했어요. 연결되면 다시 올릴게요'))
  }

  const category = book.categoryName.split('>').slice(1).join(' › ')
  const descLong = book.description.length > DESC_FOLD_AT
  const typeName = typeCode ? READING_TYPES[typeCode as keyof typeof READING_TYPES]?.name : undefined

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackButton />
        <span className="bj-h2">책 정보</span>
      </header>

      <div className="bj-content--24">
        {/* 책 기본 정보 */}
        <div className="bj-book-head">
          <div className="bj-book-cover--lg bj-book-cover--xl">
            {book.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={book.cover} alt={book.title} className="bj-cover-img" />
            )}
          </div>
          <div className="bj-book-head__body">
            <p className="bj-h1 bj-book-title">{book.title}</p>
            {book.subTitle && !book.title.includes(book.subTitle) && (
              <p className="bj-caption bj-book-meta-hint">{book.subTitle}</p>
            )}
            <p className="bj-body bj-book-author">{book.author || '작자 미상'}</p>
            <p className="bj-caption bj-book-meta-hint">
              {[book.publisher, book.pubDate?.replace(/-/g, '.'), book.itemPage ? `${book.itemPage}쪽` : null].filter(Boolean).join(' · ')}
            </p>
            {category && <p className="bj-caption bj-book-meta-hint">{category}</p>}
            <div className="bj-book-actions">
              <button
                type="button"
                onClick={handleWish}
                className={`bj-btn bj-btn--sm ${wished ? 'bj-btn--secondary' : 'bj-btn--primary'}`}
                aria-pressed={wished}
              >
                {wished ? '서재에 담김' : '서재에 담기'}
              </button>
              <a
                href={aladdinProductHref(book.isbn13)}
                target="_blank"
                rel="noreferrer"
                className="bj-btn bj-btn--sm bj-book-info-link"
              >
                책 정보보기 <AladinLogo />
              </a>
            </div>
          </div>
        </div>

        {/* 내 점수 + 내 평가 — 별 아이콘은 내 점수 전용, 평균은 텍스트로 */}
        <div className="bj-card bj-card--flat bj-col-10 bj-card-flat--p16">
          <span className="bj-caption bj-bold">
            {stats && stats.count > 0
              ? <>평균 별점 <span className="bj-stat-star">★ {stats.avg.toFixed(1)}</span> (북작 {stats.count}명)</>
              : '아직 이 책을 평가한 사람이 없어요'}
          </span>
          {typeName && extra?.typeAvg != null && (
            <span className="bj-caption">
              {typeName} 유형 평균 <span className="bj-stat-star">★ {extra.typeAvg.toFixed(1)}</span> ({extra.typeCount}명)
            </span>
          )}
          <StarRating value={stars} onChange={handleRate} size={32} />
          <p className="bj-caption" style={{ color: stars > 0 ? 'var(--color-accent)' : undefined }}>
            {stars > 0 ? `내 별점 ${stars}점` : '별을 눌러 평가해보세요 (반 칸 = 0.5점)'}
          </p>
          {stars > 0 && (
            <p className="bj-caption">
              {justSaved ? '저장했어요' : '같은 별을 다시 누르면 평가가 취소돼요'}
            </p>
          )}
          {stars > 0 && (
            <div className="bj-review-input-row">
              <textarea
                className="bj-textarea bj-textarea--flex"
                placeholder="한 줄 리뷰 남기기 (선택)"
                value={review}
                onChange={(e) => setReviewEdit(e.target.value)}
              />
              <button
                type="button"
                onClick={handleSaveReview}
                className="bj-btn bj-btn--review-save"
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
            <p className={`bj-body bj-book-desc${descLong && !descOpen ? ' bj-clamp-4' : ''}`}>
              {book.description}
            </p>
            {descLong && (
              <button type="button" onClick={() => setDescOpen((v) => !v)} className="bj-caption bj-unstyled-link bj-book-more-link bj-btn-reset">
                {descOpen ? '접기' : '더보기'}
              </button>
            )}
          </section>
        )}

        {/* 리뷰 — 내 리뷰(로컬) + 다른 사용자 리뷰(서버) */}
        {(() => {
          const otherReviews = (stats?.reviews ?? []).filter((r) => r.userId !== stats?.myUserId)
          const total = otherReviews.length + (myRating?.review ? 1 : 0)
          return (
            <section>
              <SectionLabel>리뷰 {total}</SectionLabel>
              <div className="bj-review-list">
                {myRating?.review && (
                  <article className="bj-review-item bj-review-item--mine">
                    <div className="bj-review-meta">
                      <Stars value={myRating.stars} size={12} />
                      <span className="bj-caption bj-bold">{getNickname() ?? '나'}</span>
                      <span className="bj-caption bj-review-item__mine-tag">내 리뷰</span>
                      <span className="bj-caption bj-review-time">{formatRelTime(myRating.ts)}</span>
                    </div>
                    <p className="bj-body bj-review-body">{myRating.review}</p>
                  </article>
                )}
                {otherReviews.map((r) => (
                  <article key={r.userId + r.createdAt} className="bj-review-item">
                    <div className="bj-review-meta">
                      <Stars value={r.stars} size={12} />
                      <span className="bj-caption bj-bold">{r.nickname}</span>
                      <span className="bj-caption bj-review-time">{formatRelTime(Date.parse(r.createdAt))}</span>
                    </div>
                    <p className="bj-body bj-review-body">{r.review}</p>
                  </article>
                ))}
                {total === 0 && (
                  <p className="bj-caption bj-text-center bj-review-empty">
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
            <div className="bj-card bj-card--flat bj-dist-card">
              <div className="bj-dist-avg bj-text-center">
                <p className="bj-display bj-dist-avg-num">{stats.avg.toFixed(1)}</p>
                <Stars value={stats.avg} size={13} />
                <p className="bj-caption bj-dist-avg-caption">북작 {stats.count}명 평가</p>
              </div>
              <div className="bj-flex-1 bj-col-4">
                {[5, 4, 3, 2, 1].map((n) => {
                  const pct = stats.distribution[n - 1]
                  const maxDist = Math.max(...stats.distribution)
                  return (
                    <div key={n} className="bj-meta-row">
                      <span className="bj-caption bj-dist-label">{n}★</span>
                      <div className="bj-progress__track bj-flex-1">
                        <div className="bj-progress__fill" style={{ width: `${pct}%`, opacity: pct === maxDist ? 1 : 0.45 }} />
                      </div>
                      <span className="bj-caption bj-dist-pct">{pct}%</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}
        {/* 다른 독자들은 이 책도 좋아해요 — 4점 이상 준 사람들이 4점 이상 준 다른 책 */}
        {extra && extra.alsoLiked.length > 0 && (
          <section>
            <SectionLabel>다른 독자들은 이 책도 좋아해요</SectionLabel>
            <div className="bj-rail bj-also-liked">
              {extra.alsoLiked.map((b) => (
                <Link key={b.id} href={`/rate/books/${b.id}`} className="bj-unstyled-link bj-also-liked__item">
                  <div className="bj-ext-book-cover bj-also-liked__cover">
                    {b.thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.thumbnail} alt={b.title} className="bj-cover-img" />
                    )}
                  </div>
                  <p className="bj-caption bj-also-liked__title">{b.title}</p>
                  {b.author && <p className="bj-caption bj-also-liked__author">{b.author}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/rate/books/${bookId}`} />
      </div>
      </div>
    </main>
  )
}
