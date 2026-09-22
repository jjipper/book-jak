'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ALADDIN_CATEGORIES,
  type AladdinBook,
  fetchAladdinBooks,
  searchAladdinBooks,
  shuffle,
} from '@/entities/external-book/model/aladdinBooks'
import { loadBookRatings } from '@/entities/book-rating/model/bookRatings'
import { syncMyRatings } from '@/entities/book-rating/api/ratingsRemote'
import ExternalBookRow from '@/widgets/book/ExternalBookRow'
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

interface RateViewProps {
  initialQuery?: string // /rate?q= — /search에서 넘어오면 빈 문자열이라 검색창에 바로 포커스
}

export default function RateView({ initialQuery }: RateViewProps) {
  const [query, setQuery] = useState(initialQuery ?? '')
  const q = query.trim()
  // 검색 결과는 그 결과를 낳은 질의와 함께 담아둔다 — 질의가 바뀌면 낡은 결과이므로 그 자체가 "검색 중"
  const [outcome, setOutcome] = useState<{ q: string; books: AladdinBook[]; error: boolean } | null>(null)
  const fresh = outcome !== null && outcome.q === q
  const results: AladdinBook[] = fresh ? outcome.books : []
  const searchError = fresh ? outcome.error : false
  const searching = q !== '' && !fresh

  useEffect(() => {
    const timer = setTimeout(async () => {
      // 상세에서 뒤로 왔을 때 검색 결과가 그대로 보이도록 주소에 남긴다
      window.history.replaceState(null, '', q ? `/rate?q=${encodeURIComponent(q)}` : '/rate')
      if (!q) return
      try {
        setOutcome({ q, books: await searchAladdinBooks(q, 20), error: false })
      } catch {
        setOutcome({ q, books: [], error: true })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

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
    if (q || !sentinelVisible || loading) return
    if (noGrowthRef.current >= MAX_NO_GROWTH_RETRIES) return
    void loadMore()
  }, [q, sentinelVisible, books, loading, loadMore])

  const handleRated = useCallback((bookId: string, stars: number) => {
    setRated((prev) => ({ ...prev, [bookId]: stars }))
  }, [])

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

        <input
          className="bj-input bj-rate-search"
          type="search"
          placeholder="책 제목이나 작가로 검색해서 평가하기"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus={initialQuery === ''}
        />

        {q ? (
          <>
            {searching && <p className="bj-caption bj-text-muted bj-search-loading">검색 중...</p>}
            {searchError && (
              <p className="bj-caption bj-text-muted bj-search-loading">검색에 실패했어요. 다시 시도해주세요</p>
            )}
            {fresh && !searchError && results.length === 0 && (
              <div className="bj-empty bj-card">
                <p className="bj-body bj-bold bj-mb-6">검색 결과가 없어요</p>
                <p className="bj-caption">다른 제목이나 작가 이름으로 찾아보세요</p>
              </div>
            )}
            {results.length > 0 && (
              <div className="bj-rate-list">
                {results.map((book) => (
                  <ExternalBookRow key={book.id} book={book} myStars={myRatings[book.id] ?? 0} onRated={handleRated} />
                ))}
              </div>
            )}
          </>
        ) : (
        <>
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
              <ExternalBookRow
                key={book.id}
                book={book}
                myStars={myRatings[book.id] ?? 0}
                onRated={handleRated}
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
        </>
        )}

        {/* 무한스크롤 sentinel */}
        <div ref={sentinelRef} style={{ height: 1 }} />
      </div>
    </main>
  )
}
