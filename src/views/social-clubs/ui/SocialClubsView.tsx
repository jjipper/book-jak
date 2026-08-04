'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount } from '@/entities/club/model/clubActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import type { BookClub } from '@/entities/club/model/clubs'

export default function SocialClubsView() {
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => { setClubs(loadClubs()) }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">책 모임</span>
      </header>

      <div className="bj-content--lg">
        <Link href="/social/clubs/new" className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall">
          모임 만들기
        </Link>

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
      </div>
      </div>
    </main>
  )
}
