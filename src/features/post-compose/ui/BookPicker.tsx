'use client'

import { useEffect, useState } from 'react'
import { searchAladdinBooks, type AladdinBook } from '@/entities/external-book/model/aladdinBooks'
import type { PostBook } from '@/entities/post/api/postsRemote'
import Icon from '@/shared/ui/Icon'

interface BookPickerProps {
  value: PostBook | null
  onChange: (book: PostBook | null) => void
}

/** 글에 첨부할 책 고르기 — 알라딘 키워드 검색 (평가 탭과 같은 소스) */
export default function BookPicker({ value, onChange }: BookPickerProps) {
  const [query, setQuery] = useState('')
  const q = query.trim()

  // SearchView와 같은 패턴 — 결과를 그 결과를 낳은 질의와 함께 담아,
  // 질의가 바뀌면 그 자체로 "검색 중"이 되게 한다
  const [outcome, setOutcome] = useState<{ q: string; books: AladdinBook[]; error: boolean } | null>(null)
  const fresh = outcome !== null && outcome.q === q
  const results = fresh ? outcome.books : []
  const failed = fresh ? outcome.error : false
  const searching = q !== '' && !fresh

  useEffect(() => {
    if (!q) return
    const timer = setTimeout(async () => {
      try {
        setOutcome({ q, books: await searchAladdinBooks(q), error: false })
      } catch {
        setOutcome({ q, books: [], error: true })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [q])

  function pick(book: AladdinBook) {
    onChange({ title: book.title, isbn: book.isbn13, cover: book.cover || null })
    setQuery('')
    setOutcome(null)
  }

  if (value) {
    return (
      <div className="bj-book-pick">
        {value.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.cover} alt="" className="bj-book-pick__cover" />
        )}
        <p className="bj-body bj-book-pick__title">{value.title}</p>
        <button
          type="button"
          className="bj-icon-btn"
          onClick={() => onChange(null)}
          aria-label="첨부한 책 빼기"
        >
          <Icon name="x" size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="bj-col-8">
      <input
        className="bj-input"
        type="search"
        placeholder="책 제목이나 작가로 검색 (선택)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {searching && <p className="bj-caption bj-text-muted">검색 중…</p>}
      {failed && <p className="bj-caption bj-text-muted">검색에 실패했어요. 다시 시도해주세요</p>}
      {!searching && !failed && q !== '' && results.length === 0 && (
        <p className="bj-caption bj-text-muted">검색 결과가 없어요</p>
      )}

      {results.length > 0 && (
        <ul className="bj-book-pick-list">
          {results.map((book) => (
            <li key={book.id}>
              <button type="button" className="bj-book-pick-option" onClick={() => pick(book)}>
                {book.cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={book.cover} alt="" className="bj-book-pick__cover" />
                )}
                <span className="bj-book-pick-option__body">
                  <span className="bj-body bj-book-pick__title">{book.title}</span>
                  <span className="bj-caption bj-truncate">{book.author}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
