'use client'

import { useEffect, useMemo, useState } from 'react'
import { searchExternalBooks, type ExternalBook } from '@/entities/external-book/model/externalBooks'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import ExternalBookRow from '@/widgets/book/ExternalBookRow'
import { useMounted } from '@/shared/lib/useMounted'
import BackLink from '@/shared/ui/BackLink'

export default function SearchView() {
  const [query, setQuery] = useState('')
  const mounted = useMounted()
  const myRatings: BookRatingRecord[] = useMemo(() => (mounted ? loadBookRatings() : []), [mounted])

  // 검색 결과는 그 결과를 낳은 질의와 함께 담아둔다. 화면 상태는 전부 여기서 파생된다 —
  // 질의가 바뀌면 결과가 낡은 것이 되므로 그 자체가 "검색 중"이다.
  const q = query.trim()
  const [outcome, setOutcome] = useState<{ q: string; books: ExternalBook[]; error: boolean } | null>(null)
  const fresh = outcome !== null && outcome.q === q
  const results: ExternalBook[] = fresh ? outcome.books : []
  const searchError = fresh ? outcome.error : false
  const searching = q !== '' && !fresh

  useEffect(() => {
    if (!q) return
    const timer = setTimeout(async () => {
      try {
        setOutcome({ q, books: await searchExternalBooks(q), error: false })
      } catch {
        setOutcome({ q, books: [], error: true })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

  const myStarsOf = (bookId: string) => myRatings.find((r) => r.bookId === bookId)?.stars

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">책 검색</span>
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
