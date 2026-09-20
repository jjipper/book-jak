'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount } from '@/entities/club/model/clubActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import type { BookClub } from '@/entities/club/model/clubs'
import BackLink from '@/shared/ui/BackLink'

export default function SocialClubsView() {
  const [clubs, setClubs] = useState<BookClub[] | null>(null)

  useEffect(() => { async function load() { setClubs(await loadClubs()) }; void load() }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/social" />
        <span className="bj-h2">책 모임</span>
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
            <p className="bj-caption">첫 모임을 열면 관심 있는 사람이 모여요</p>
          </div>
        ) : (
        <div className="bj-col-10">
          {clubs.map((club) => {
            const organizer = resolveAuthor(club.organizerId)
            const memberCount = displayMemberCount(club)
            const isFull = memberCount >= club.capacity
            return (
              <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row bj-row--top bj-unstyled-link">
                <div className="bj-flex-1">
                  <div className="bj-meta-row bj-mb-4">
                    <p className="bj-body bj-bold bj-discuss-text">{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                  </div>
                  <p className="bj-caption bj-mb-6">{club.description}</p>
                  <div className="bj-tag-group">
                    {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
                  </div>
                </div>
                <div className="bj-club-count">
                  <p className={`bj-caption bj-bold${isFull ? ' bj-club-count--full' : ' bj-club-count--open'}`}>
                    {memberCount}/{club.capacity}
                  </p>
                  <p className="bj-caption bj-caption--xs">{organizer.nickname}</p>
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
