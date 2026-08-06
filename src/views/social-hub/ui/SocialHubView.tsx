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
    <div className="bj-section__head">
      <p className="bj-h2">{title}</p>
      <Link href={moreHref} className="bj-caption bj-bold">더보기 →</Link>
    </div>
  )
}

export default function SocialHubView() {
  const [matched, setMatched] = useState<MatchedPerson[]>([])
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      setMatched(getMatchedPeople())
      const qs = (await loadQuestions()).slice(0, 3)
      setQuestions(qs)
      const counts: Record<string, number> = {}
      for (const q of qs) { counts[q.id] = (await loadAnswers(q.id)).length }
      setAnswerCounts(counts)
      setClubs((await loadClubs()).slice(0, 3))
    }
    void load()
  }, [])

  return (
    <main className="bj-shell bj-shell--pb">
      <div className="bj-frame">
      <header className="bj-hub-header">
        <span className="bj-display bj-display--lg">소셜</span>
      </header>

      <div className="bj-col-28">

        {/* 취향 맞는 사람 — 프로필 캐러셀 */}
        <div>
          <SectionHeader  title="나와 비슷한 북작러" moreHref="/social/people" />
          {matched.length > 0 ? (
            <div className="bj-rail bj-rail--lg-wrap bj-hub-people-rail">
              {matched.slice(0, 10).map(({ person, affinity }) => {
                const type = READING_TYPES[person.typeCode]
                return (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="bj-hub-person-link"
                  >
                    <div className="bj-hub-person-face">
                      <IllustPlaceholder code={type.code} alt={person.nickname} aspectRatio="1 / 1" />
                    </div>
                    <p className="bj-caption bj-hub-person-name">
                      {person.nickname}
                    </p>
                    <p className="bj-caption bj-hub-person-pct">{affinity}%</p>
                  </Link>
                )
              })}
            </div>
          ) : (
            <Link href="/test" className="bj-card--flat bj-unstyled-link bj-text-center">
              <p className="bj-caption">독서유형 테스트를 하면 취향 맞는 사람을 보여드려요 →</p>
            </Link>
          )}
        </div>

        {/* 소통해요 */}
        <div>
          <SectionHeader title="의견으로 북작" moreHref="/social/discuss" />
          <div className="bj-list bj-list--lg-grid-2 bj-col-10">
            {questions.map((q) => {
              const author = resolveAuthor(q.authorId)
              return (
                <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row bj-row--top bj-unstyled-link">
                  <div className="bj-flex-1">
                    <p className="bj-caption bj-bold bj-mb-4">{bookTitle(q.bookId)}</p>
                    <p className="bj-body bj-discuss-text bj-truncate">{q.text}</p>
                    <p className="bj-caption">{author.nickname} · 답변 {answerCounts[q.id] ?? 0}개</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 함께해요 */}
        <div>
          <SectionHeader title="함께 모여 북작" moreHref="/social/clubs" />
          <div className="bj-list bj-list--lg-grid-2 bj-col-10">
            {clubs.map((club) => {
              const organizer = resolveAuthor(club.organizerId)
              const memberCount = displayMemberCount(club)
              return (
                <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row bj-row--top bj-unstyled-link">
                  <div className="bj-flex-1">
                    <div className="bj-meta-row bj-mb-4">
                      <p className="bj-body bj-bold bj-discuss-text">{club.name}</p>
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
