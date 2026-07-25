'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { getMatchedPeople, type MatchedPerson } from '@/features/people-match/model/peopleMatch'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
import { loadClubs, displayMemberCount } from '@/entities/club/model/clubActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import type { BookClub } from '@/entities/club/model/clubs'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

function bookTitle(bookId: number | null): string {
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

export default function SocialHubView() {
  const [matched, setMatched] = useState<MatchedPerson[]>([])
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => {
    setMatched(getMatchedPeople())
    setQuestions(loadQuestions().slice(0, 3))
    setClubs(loadClubs().slice(0, 3))
  }, [])

  return (
    <main className="bj-shell" style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <span className="bj-display bj-display--lg">소셜</span>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* 취향 맞는 사람 — 프로필 캐러셀 */}
        <div>
          <SectionHeader  title="나와 비슷한 북작러" moreHref="/social/people" />
          {matched.length > 0 ? (
            <div className="bj-rail bj-rail--lg-wrap" style={{ gap: 16, paddingBottom: 4 }}>
              {matched.slice(0, 10).map(({ person, affinity }) => {
                const type = READING_TYPES[person.typeCode]
                return (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0, width: 64, textAlign: 'center' }}
                  >
                    <div style={{ width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 6px' }}>
                      <IllustPlaceholder code={type.code} alt={person.nickname} aspectRatio="1 / 1" />
                    </div>
                    <p className="bj-caption" style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {person.nickname}
                    </p>
                    <p className="bj-caption" style={{ fontSize: 10, color: 'var(--color-action)' }}>{affinity}%</p>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Link href="/test" className="bj-card--flat" style={{ display: 'block', textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <p className="bj-caption">독서유형 테스트를 하면 취향 맞는 사람을 보여드려요 →</p>
            </Link>
          )}
        </div>

        {/* 소통해요 */}
        <div>
          <SectionHeader title="의견으로 북작" moreHref="/social/discuss" />
          <div className="bj-list bj-list--lg-grid-2" style={{ gap: 10 }}>
            {questions.map((q) => {
              const author = resolveAuthor(q.authorId)
              const answerCount = loadAnswers(q.id).length
              return (
                <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{bookTitle(q.bookId)}</p>
                    <p className="bj-body" style={{ fontSize: 14, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.text}</p>
                    <p className="bj-caption">{author.nickname} · 답변 {answerCount}개</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 함께해요 */}
        <div>
          <SectionHeader title="함께 모여 북작" moreHref="/social/clubs" />
          <div className="bj-list bj-list--lg-grid-2" style={{ gap: 10 }}>
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
                    <p className="bj-caption">{organizer.nickname} · {memberCount}/{club.capacity}명</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

      </div>
      </div>
    </main>
  )
}
