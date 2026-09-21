'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ALADDIN_CATEGORIES,
  type AladdinBook,
  fetchAladdinBooks,
  shuffle,
} from '@/entities/external-book/model/aladdinBooks'
import { getBookRating, loadBookRatings, removeBookRating, saveBookRating } from '@/entities/book-rating/model/bookRatings'
import { deleteRating, pushRating, syncMyRatings } from '@/entities/book-rating/api/ratingsRemote'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import StarRating from '@/shared/ui/StarRating'
import { useMounted } from '@/shared/lib/useMounted'

const QUERY_TYPES = ['Bestseller', 'ItemNewAll', 'BlogBest'] as const
const BATCH_SIZE = 20
const MAX_NO_GROWTH_RETRIES = 15

function pickCategory(catId: string) {
  if (catId !== '0') return catId
  const nonAll = ALADDIN_CATEGORIES.filter((c) => c.id !== '0')
  return nonAll[Math.floor(Math.random() * nonAll.length)].id
}

function pickQueryType() {
  return QUERY_TYPES[Math.floor(Math.random() * QUERY_TYPES.length)]
}

interface RateCardProps {
  book: AladdinBook
  myStars: number
  onRate: (book: AladdinBook, stars: number) => void
}

function RateCard({ book, myStars, onRate }: RateCardProps) {
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
          <StarRating value={myStars} onChange={(stars) => onRate(book, stars)} size={20} />
          {myStars > 0 && (
            <span className="bj-caption bj-bold bj-caption--action">{myStars}점 평가함</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RateView() {
  const [selectedCat, setSelectedCat] = useState('0')
  // 목록은 어느 카테고리의 것인지와 함께 담는다 — 카테고리가 바뀌면 그 자체로 빈 목록이 된다
  const [loaded, setLoaded] = useState<{ cat: string; items: AladdinBook[] }>({ cat: '0', items: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const noGrowthRef = useRef(0)
  // 카테고리+queryType 조합별 다음 start 위치 — 같은 구간을 반복 조회하지 않도록 순차 페이징
  const cursorsRef = useRef<Map<string, number>>(new Map())
  const [sentinelVisible, setSentinelVisible] = useState(false)

  // 로컬 별점 — localStorage가 원본이고(마운트 후에만 읽는다), 이번 화면에서 준 별점만 덮어쓴다
  const mounted = useMounted()
  const [rated, setRated] = useState<Record<string, number>>({})
  const [synced, setSynced] = useState(0)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  // 서버의 내 평가를 먼저 내려받아 로컬 사본을 맞춘다 (기기 바뀌어도 별점 유지)
  useEffect(() => {
    void syncMyRatings().then(() => setSynced((n) => n + 1))
  }, [])

  const myRatings: Record<string, number> = useMemo(() => {
    if (!mounted) return rated
    const map: Record<string, number> = {}
    for (const r of loadBookRatings()) map[r.bookId] = r.stars
    return { ...map, ...rated }
    // synced가 바뀌면 로컬 사본을 다시 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, rated, synced])

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    setError(null)
    try {
      const categoryId = pickCategory(selectedCat)
      const queryType = pickQueryType()
      const cursorKey = `${categoryId}:${queryType}`
      const start = cursorsRef.current.get(cursorKey) ?? 1
      const fetched = await fetchAladdinBooks({
        categoryId,
        queryType,
        start,
        maxResults: BATCH_SIZE,
      })
      cursorsRef.current.set(cursorKey, start + BATCH_SIZE)
      const shuffled = shuffle(fetched)
      setLoaded((prev) => {
        const base = prev.cat === selectedCat ? prev.items : []
        const existingIds = new Set(base.map((b) => b.id))
        const fresh = shuffled.filter((b) => !existingIds.has(b.id))
        noGrowthRef.current = fresh.length > 0 ? 0 : noGrowthRef.current + 1
        return { cat: selectedCat, items: fresh.length > 0 ? [...base, ...fresh] : base }
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '책을 불러오지 못했어요')
      noGrowthRef.current += 1
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [selectedCat])

  const books: AladdinBook[] = useMemo(
    () => (loaded.cat === selectedCat ? loaded.items : []),
    [loaded, selectedCat],
  )

  // 카테고리 변경 시 페이징 커서를 비우고 처음부터 다시 불러온다
  useEffect(() => {
    noGrowthRef.current = 0
    cursorsRef.current.clear()
    void loadMore()
  }, [selectedCat, loadMore])

  // IntersectionObserver — sentinel의 화면 진입/이탈 상태만 추적
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => setSentinelVisible(entries[0]?.isIntersecting ?? false),
      { rootMargin: '600px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // sentinel이 보이는 동안은 콘텐츠가 화면을 채울 때까지 계속 추가 로드
  // (짧은 페이지에서는 sentinel이 계속 보이는 상태로 고정돼 IntersectionObserver가
  //  재발동하지 않으므로, books 변화를 감지해 직접 이어서 로드한다)
  useEffect(() => {
    if (!sentinelVisible || loading) return
    if (noGrowthRef.current >= MAX_NO_GROWTH_RETRIES) return
    void loadMore()
  }, [sentinelVisible, books, loading, loadMore])

  function handleRate(book: AladdinBook, stars: number) {
    requireAuth(() => {
      setRated((prev) => ({ ...prev, [book.id]: stars }))
      // 같은 별을 다시 누르면 0 — 평가 취소 (0점으로 저장하면 서버 check 제약에 걸린다)
      if (stars === 0) {
        removeBookRating(book.id)
        deleteRating(book.id).catch(() => {})
        return
      }
      saveBookRating({ bookId: book.id, title: book.title, categoryName: book.categoryName, stars, review: getBookRating(book.id)?.review, ts: Date.now() })
      // 실패해도 로컬엔 남아 있고, 다음 syncMyRatings 때 다시 올라간다
      pushRating(
        { id: book.id, title: book.title, authors: [book.author], publisher: book.publisher, thumbnail: book.cover, categoryName: book.categoryName },
        stars,
      ).catch(() => {})
    })
  }

  const ratedCount = Object.values(myRatings).filter(Boolean).length

  return (
    <main className="bj-shell bj-content">
      <div className="bj-frame">
        <header className="bj-page-head">
          <span className="bj-display bj-display--lg">평가</span>
          <p className="bj-caption">
            별점을 줄수록 내 장르 취향이 선명해져요
            {ratedCount > 0 && (
              <span className="bj-bold bj-caption--action"> · {ratedCount}권 평가함</span>
            )}
          </p>
        </header>

        {/* 카테고리 필터 */}
        <div className="bj-rail bj-rail--lg-wrap bj-genre-rail">
          {ALADDIN_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCat(c.id)}
              className={`bj-chip bj-genre-chip${selectedCat === c.id ? ' bj-chip--active' : ''}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* 책 리스트 — 한 줄에 한 권 */}
        {books.length > 0 && (
          <div className="bj-rate-list">
            {books.map((book) => (
              <RateCard
                key={book.id}
                book={book}
                myStars={myRatings[book.id] ?? 0}
                onRate={handleRate}
              />
            ))}
          </div>
        )}

        {/* 에러 */}
        {error && !loading && (
          <div className="bj-search-empty">
            <p className="bj-body bj-text-muted bj-mb-4">{error}</p>
            <button
              type="button"
              className="bj-btn bj-btn--secondary"
              onClick={() => void loadMore()}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 로딩 인디케이터 */}
        {loading ? (
          <p className="bj-caption bj-text-muted bj-search-loading">책 불러오는 중…</p>
        ) : books.length > 0 && (
          <p className="bj-caption bj-text-muted bj-search-loading">스크롤하면 새 책이 계속 나와요</p>
        )}

        {/* 무한스크롤 sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next="/rate" />
    </main>
  )
}
