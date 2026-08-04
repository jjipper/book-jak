'use client'

import { useEffect, useMemo, useState } from 'react'
import { BOOKS, BOOK_GENRES } from '@/entities/book/model/books'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import { searchExternalBooks, type ExternalBook } from '@/entities/external-book/model/externalBooks'
import BookRow from '@/widgets/book/BookRow'
import ExternalBookRow from '@/widgets/book/ExternalBookRow'

export default function RateView() {
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState<string>('전체')
  const [myRatings, setMyRatings] = useState<BookRatingRecord[]>([])
  const [results, setResults] = useState<ExternalBook[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)

  useEffect(() => {
    setMyRatings(loadBookRatings())
  }, [])

  // 검색어 입력 시 카카오 책 검색 (300ms 디바운스)
  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setSearching(false)
      setSearchError(false)
      return
    }
    setSearching(true)
    setSearchError(false)
    const timer = setTimeout(async () => {
      try {
        const books = await searchExternalBooks(q)
        setResults(books)
      } catch {
        setResults([])
        setSearchError(true)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const isSearchMode = query.trim().length > 0

  // 검색어 없을 때 보여주는 큐레이션 목록 (목업 카탈로그, 인기순)
  const curated = useMemo(() => {
    return BOOKS
      .filter((b) => genre === '전체' || b.genre === genre)
      .sort((a, b) => b.ratingCount - a.ratingCount)
  }, [genre])

  const ratedCount = myRatings.length
  const myStarsOf = (bookId: string) => myRatings.find((r) => r.bookId === bookId)?.stars

  return (
    <main className="bj-shell bj-content">
      <div className="bj-frame">
      <header className="bj-page-head">
        <span className="bj-display bj-display--lg">평가</span>
        <p className="bj-caption bj-mt-6">
          읽은 책을 평가할수록 예상 점수가 정확해져요
          {ratedCount > 0 && <span className="bj-bold bj-caption--action"> · {ratedCount}권 평가함</span>}
        </p>
      </header>

      <div className="bj-col-14">
        <input
          className="bj-input bj-search-input"
          type="search"
          placeholder="책 제목이나 작가를 검색해보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isSearchMode ? (
          <>
            {searching && <p className="bj-caption bj-search-loading">검색 중…</p>}

            {!searching && searchError && (
              <div className="bj-search-empty">
                <p className="bj-body bj-text-muted bj-mb-4">검색에 실패했어요</p>
                <p className="bj-caption">네트워크 상태를 확인하고 다시 시도해보세요</p>
              </div>
            )}

            {!searching && !searchError && results.length > 0 && (
              <div className="bj-list bj-list--lg-grid-2 bj-list--gap10">
                {results.map((book) => (
                  <ExternalBookRow key={book.id} book={book} myStars={myStarsOf(book.id)} />
                ))}
              </div>
            )}

            {!searching && !searchError && results.length === 0 && (
              <div className="bj-search-empty">
                <p className="bj-body bj-text-muted bj-mb-4">
                  &lsquo;{query}&rsquo; 검색 결과가 없어요
                </p>
                <p className="bj-caption">제목이나 작가 이름으로 다시 검색해보세요</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bj-rail bj-rail--lg-wrap bj-genre-rail">
              {BOOK_GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`bj-chip bj-genre-chip${genre === g ? ' bj-chip--active' : ''}`}
                >
                  {g}
                </button>
              ))}
            </div>

            <p className="bj-caption bj-bold">북작 추천 서가</p>
            <div className="bj-list bj-list--lg-grid-2 bj-list--gap10">
              {curated.map((book) => (
                <BookRow key={book.id} book={book} myStars={myStarsOf(book.id)} />
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </main>
  )
}
