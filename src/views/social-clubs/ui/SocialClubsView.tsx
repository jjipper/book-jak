'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount, getInterestedIds } from '@/entities/club/model/clubActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import ClubInterestButton from '@/entities/club/ui/ClubInterestButton'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { clubIllust, type BookClub } from '@/entities/club/model/clubs'
import BackLink from '@/shared/ui/BackLink'

export default function SocialClubsView() {
  const [clubs, setClubs] = useState<BookClub[] | null>(null)
  const [interested, setInterested] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const [list, ids] = await Promise.all([loadClubs(), getInterestedIds()])
      setClubs(list)
      setInterested(ids)
    }
    void load()
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/social" />
        <span className="bj-h2">모임</span>
      </header>

      <div className="bj-content--lg">
        <Link href="/social/clubs/new" className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall">
          모임 만들기
        </Link>

        {clubs === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : clubs.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 열린 모임이 없어요</p>
            <p className="bj-caption">위에서 첫 모임을 만들어보세요</p>
          </div>
        ) : (
        <div className="bj-col-10">
          {clubs.map((club) => {
            const organizer = club.organizerId ? resolveAuthor(club.organizerId).nickname : '북작'
            const memberCount = displayMemberCount(club)
            const isFull = memberCount >= club.capacity
            return (
              <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row bj-row--top bj-unstyled-link">
                <IllustPlaceholder
                  code={clubIllust(club)}
                  alt=""
                  aspectRatio="1 / 1"
                  className="bj-club-thumb"
                  background="var(--color-control-surface)"
                />
                <div className="bj-flex-1">
                  <div className="bj-meta-row bj-mb-4">
                    {club.isOfficial && <span className="bj-chip bj-chip--active">공식</span>}
                    <p className="bj-body bj-bold bj-discuss-text">{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                  </div>
                  <p className="bj-caption bj-mb-6 bj-clamp-3">{club.description}</p>
                  <div className="bj-tag-group">
                    {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
                  </div>
                </div>
                <div className="bj-club-count">
                  <p className={`bj-caption bj-bold${isFull ? ' bj-club-count--full' : ' bj-club-count--open'}`}>
                    {memberCount}/{club.capacity}
                  </p>
                  <p className="bj-caption bj-caption--xs bj-mb-4">{organizer}</p>
                  <ClubInterestButton
                    clubId={club.id}
                    interested={interested.includes(club.id)}
                    onChange={(next) =>
                      setInterested((prev) => (next ? [...prev, club.id] : prev.filter((id) => id !== club.id)))
                    }
                  />
                </div>
              </Link>
            )
          })}
        </div>
        )}
      </div>
      </div>
    </main>
  )
}
