'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { searchExternalBooks, type ExternalBook } from '@/entities/external-book/model/externalBooks'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import ExternalBookRow from '@/widgets/book/ExternalBookRow'

export default function SearchView() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExternalBook[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const [myRatings, setMyRatings] = useState<BookRatingRecord[]>([])

  useEffect(() => {
    setMyRatings(loadBookRatings())
  }, [])

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
        setResults(await searchExternalBooks(q))
      } catch {
        setResults([])
        setSearchError(true)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const myStarsOf = (bookId: string) => myRatings.find((r) => r.bookId === bookId)?.stars

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">책 검색</span>
        </header>

        <div className="bj-content--lg">
          <input
            className="bj-input bj-search-input"
            type="search"
            placeholder="책 제목이나 작가를 검색해보세요"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

          {searching && (
            <p className="bj-caption bj-text-muted bj-search-loading">검색 중...</p>
          )}

          {searchError && (
            <p className="bj-caption bj-text-muted bj-search-loading">검색에 실패했어요. 다시 시도해주세요</p>
          )}

          {!searching && query.trim() && results.length === 0 && !searchError && (
            <div className="bj-empty bj-card">
              <p className="bj-body bj-bold bj-mb-6">검색 결과가 없어요</p>
              <p className="bj-caption">다른 제목이나 작가 이름으로 찾아보세요</p>
            </div>
          )}

          {!query.trim() && (
            <div className="bj-empty bj-card">
              <p className="bj-body bj-bold bj-mb-6">읽은 책을 찾아보세요</p>
              <p className="bj-caption">제목이나 작가 이름으로 검색하면<br />별점을 남길 수 있어요</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="bj-col-10">
              {results.map((book) => (
                <ExternalBookRow key={book.id} book={book} myStars={myStarsOf(book.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
