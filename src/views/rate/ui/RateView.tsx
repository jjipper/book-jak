'use client'

// TODO: 평가 데이터 Supabase pushRating으로 전환 (현재 localStorage 병행)

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALADDIN_CATEGORIES,
  type AladdinBook,
  fetchAladdinBooks,
  shuffle,
} from '@/entities/external-book/model/aladdinBooks'
import { loadBookRatings, saveBookRating } from '@/entities/book-rating/model/bookRatings'
import { pushRating } from '@/entities/book-rating/api/ratingsRemote'
import StarRating from '@/shared/ui/StarRating'

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
      <div className="bj-ext-book-cover">
        {book.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover} alt={book.title} className="bj-cover-img" />
        )}
      </div>
      <div className="bj-book-row__body">
        <p className="bj-body bj-truncate bj-book-title-sm">{book.title}</p>
        <p className="bj-caption bj-truncate bj-caption--hint">{book.author}</p>
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
  const [books, setBooks] = useState<AladdinBook[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [myRatings, setMyRatings] = useState<Record<string, number>>({})
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const noGrowthRef = useRef(0)
  // 카테고리+queryType 조합별 다음 start 위치 — 같은 구간을 반복 조회하지 않도록 순차 페이징
  const cursorsRef = useRef<Map<string, number>>(new Map())
  const [sentinelVisible, setSentinelVisible] = useState(false)

  // 로컬 별점 초기화
  useEffect(() => {
    const records = loadBookRatings()
    const map: Record<string, number> = {}
    for (const r of records) map[r.bookId] = r.stars
    setMyRatings(map)
  }, [])

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
      setBooks((prev) => {
        const existingIds = new Set(prev.map((b) => b.id))
        const fresh = shuffled.filter((b) => !existingIds.has(b.id))
        noGrowthRef.current = fresh.length > 0 ? 0 : noGrowthRef.current + 1
        return fresh.length > 0 ? [...prev, ...fresh] : prev
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : '책을 불러오지 못했어요')
      noGrowthRef.current += 1
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [selectedCat])

  // 카테고리 변경 시 목록 초기화
  useEffect(() => {
    noGrowthRef.current = 0
    cursorsRef.current.clear()
    setBooks([])
    void loadMore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCat])

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
    setMyRatings((prev) => ({ ...prev, [book.id]: stars }))
    saveBookRating({ bookId: book.id, title: book.title, categoryName: book.categoryName, stars, ts: Date.now() })
    void pushRating(
      { id: book.id, title: book.title, authors: [book.author], publisher: book.publisher, thumbnail: book.cover },
      stars,
    )
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
        {loading && (
          <p className="bj-caption bj-text-muted bj-search-loading">책 불러오는 중…</p>
        )}

        {/* 무한스크롤 sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </main>
  )
}
