'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadResult } from '@/lib/scoring'
import { READING_TYPES } from '@/data/readingTypes'
import { BLIND_BOOKS, type BlindBook } from '@/data/blindBooks'
import { pickDailyBooks, dateKeyOf } from '@/lib/dailyDiscover'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/lib/discussions'
import { loadClubs, displayMemberCount } from '@/lib/clubs'
import { resolveAuthor } from '@/lib/author'
import type { BookClub } from '@/data/clubs'
import RarityBadge from '@/components/ui/RarityBadge'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

const PREVIEW_CODES = ['FIEW', 'TIGR', 'TCGW', 'FIER', 'TCEW', 'FIGW'] as const

function discussBookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

function SectionHeader({ title, moreHref }: { title: string; moreHref: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
      <p className="bj-h2">{title}</p>
      <Link href={moreHref} className="bj-caption" style={{ fontWeight: 700 }}>더보기 →</Link>
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

export default function HomePage() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [dailyBooks, setDailyBooks] = useState<BlindBook[]>([])
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => {
    setSavedResult(loadResult())
    setDailyBooks(pickDailyBooks(dateKeyOf(new Date())))
    setQuestions(loadQuestions().slice(0, 2))
    setClubs(loadClubs().slice(0, 2))
  }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

  return (
    <main style={{ minHeight: '100dvh' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="bj-riso" style={{ width: 26, height: 26 }}>
            <span className="bj-riso__a" style={{ width: 26, height: 26, background: 'var(--color-action)' }} />
            <span className="bj-riso__b" style={{ width: 26, height: 26, background: 'var(--p-riso-blue)' }} />
          </span>
          <span className="bj-display bj-display--lg">북작</span>
        </Link>
        <button className="bj-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* 독서유형 테스트 진입 버튼 */}
        <Link href="/test" className="bj-btn bj-btn--primary bj-btn--block" style={{ padding: '16px 0', fontSize: 16 }}>
          독서유형 테스트
        </Link>

        {/* 오늘의 발견 — 제목·표지를 가린 블라인드 카드 미리보기 */}
        <div>
          <SectionHeader title="오늘의 발견" moreHref="/discover" />
          {dailyBooks.length > 0 && (
            <div className="scrollbar-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
              {dailyBooks.map((book) => {
                const primary = book.tags.find((t) => t.kind === 'primary')?.text ?? ''
                const genre = book.meta.find((m) => m.key === '장르')?.value ?? ''
                const mood = book.meta.find((m) => m.key === '분위기')?.value ?? ''
                const descText = book.desc.map((s) => s.text).join('')
                return (
                  <Link
                    key={book.id}
                    href="/discover"
                    className="bj-card"
                    style={{ flexShrink: 0, width: 168, padding: 14, display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--color-text-hint)' }}>
                      <LockIcon />
                      <span className="bj-caption" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>블라인드</span>
                    </div>
                    <p className="bj-body" style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3 }}>{primary}</p>
                    <p className="bj-caption" style={{ color: 'var(--color-text-hint)' }}>{genre} · {mood}</p>
                    <p
                      className="bj-caption"
                      style={{ lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                    >
                      {descText}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* 의견 나누기 */}
        {questions.length > 0 && (
          <div>
            <SectionHeader title="의견 나누기" moreHref="/social/discuss" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {questions.map((q) => {
                const author = resolveAuthor(q.authorId)
                const answerCount = loadAnswers(q.id).length
                return (
                  <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{discussBookTitle(q.bookId)}</p>
                      <p className="bj-body" style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</p>
                      <p className="bj-caption" style={{ color: 'var(--color-text-hint)' }}>{author.nickname} · 답변 {answerCount}개</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* 책 모임 */}
        {clubs.length > 0 && (
          <div>
            <SectionHeader title="책 모임" moreHref="/social/clubs" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {clubs.map((club) => {
                const organizer = resolveAuthor(club.organizerId)
                const memberCount = displayMemberCount(club)
                return (
                  <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>{club.name}</p>
                        <span className="bj-chip">{club.format}</span>
                      </div>
                      <p className="bj-caption" style={{ color: 'var(--color-text-hint)' }}>{organizer.nickname} · {memberCount}/{club.capacity}명</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* 소셜 (Phase 3~5) */}
        {myType && (
          <Link href="/social" style={{ textDecoration: 'none' }}>
            <div className="bj-row">
              <div style={{ flex: 1 }}>
                <p className="bj-body" style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>소셜 둘러보기</p>
                <p className="bj-caption">취향 맞는 사람 · 의견 나누기 · 모임</p>
              </div>
              <span className="bj-caption" style={{ fontWeight: 700 }}>→</span>
            </div>
          </Link>
        )}

        {/* 16유형 갤러리 */}
        <div>
          <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
            16가지 독서 유형 미리보기
          </p>
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {PREVIEW_CODES.map((code) => {
              const t = READING_TYPES[code]
              return (
                <div key={code} className="bj-card" style={{ flexShrink: 0, width: 108, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IllustPlaceholder code={t.code} alt={t.name} aspectRatio="1 / 1" />
                  <span className="bj-caption" style={{ fontWeight: 700 }}>{t.code}</span>
                  <span className="bj-body" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{t.name}</span>
                  <RarityBadge level={t.rarityLevel} pct={t.rarityPct} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
