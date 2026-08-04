'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount, getJoinedIds } from '@/entities/club/model/clubActions'
import { ME_ID } from '@/features/resolve-author/model/author'
import type { BookClub } from '@/entities/club/model/clubs'

export default function MyClubsView() {
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => {
    const joined = getJoinedIds()
    setClubs(loadClubs().filter((c) => c.organizerId === ME_ID || joined.includes(c.id)))
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">신청한 모임</span>
      </header>

      <div className="bj-content">
        {clubs.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 신청한 모임이 없어요</p>
            <Link href="/social/clubs" className="bj-btn bj-btn--primary bj-btn--cta">
              책 모임 보러가기
            </Link>
          </div>
        ) : (
          clubs.map((club) => {
            const memberCount = displayMemberCount(club)
            const isMine = club.organizerId === ME_ID
            return (
              <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row bj-row--top bj-unstyled-link">
                <div className="bj-flex-1">
                  <div className="bj-meta-row bj-mb-4">
                    <p className="bj-body bj-bold bj-body--sm">{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                    {isMine && <span className="bj-chip bj-chip--active">내가 만든 모임</span>}
                  </div>
                  <p className="bj-caption">{club.description}</p>
                </div>
                <p className="bj-caption bj-bold bj-flex-none">{memberCount}/{club.capacity}</p>
              </Link>
            )
          })
        )}
      </div>
      </div>
    </main>
  )
}
