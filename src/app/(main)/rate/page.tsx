'use client'

import { useEffect, useMemo, useState } from 'react'
import { BOOKS, BOOK_GENRES } from '@/data/books'
import { loadBookRatings, type BookRatingRecord } from '@/lib/bookRatings'
import { searchExternalBooks, type ExternalBook } from '@/lib/externalBooks'
import BookRow from '@/components/rate/BookRow'
import ExternalBookRow from '@/components/rate/ExternalBookRow'

export default function RatePage() {
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
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ padding: '52px 20px 16px' }}>
        <span className="bj-display bj-display--lg">평가</span>
        <p className="bj-caption" style={{ marginTop: 6 }}>
          읽은 책을 평가할수록 예상 점수가 정확해져요
          {ratedCount > 0 && <span style={{ fontWeight: 700, color: 'var(--color-action)' }}> · {ratedCount}권 평가함</span>}
        </p>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <input
          className="bj-input"
          type="search"
          placeholder="책 제목이나 작가를 검색해보세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {isSearchMode ? (
          <>
            {searching && <p className="bj-caption" style={{ textAlign: 'center', padding: '24px 0' }}>검색 중…</p>}

            {!searching && searchError && (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p className="bj-body" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>검색에 실패했어요</p>
                <p className="bj-caption">네트워크 상태를 확인하고 다시 시도해보세요</p>
              </div>
            )}

            {!searching && !searchError && results.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {results.map((book) => (
                  <ExternalBookRow key={book.id} book={book} myStars={myStarsOf(book.id)} />
                ))}
              </div>
            )}

            {!searching && !searchError && results.length === 0 && (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <p className="bj-body" style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  &lsquo;{query}&rsquo; 검색 결과가 없어요
                </p>
                <p className="bj-caption">제목이나 작가 이름으로 다시 검색해보세요</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {BOOK_GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGenre(g)}
                  className={`bj-chip${genre === g ? ' bj-chip--active' : ''}`}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                  {g}
                </button>
              ))}
            </div>

            <p className="bj-caption" style={{ fontWeight: 700 }}>북작 추천 서가</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {curated.map((book) => (
                <BookRow key={book.id} book={book} myStars={myStarsOf(book.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
