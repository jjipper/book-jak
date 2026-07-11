'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount, getJoinedIds } from '@/lib/clubs'
import { ME_ID } from '@/lib/author'
import type { BookClub } from '@/data/clubs'

export default function MyClubsPage() {
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => {
    const joined = getJoinedIds()
    setClubs(loadClubs().filter((c) => c.organizerId === ME_ID || joined.includes(c.id)))
  }, [])

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">신청한 모임</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clubs.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 신청한 모임이 없어요</p>
            <Link href="/social/clubs" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              책 모임 보러가기
            </Link>
          </div>
        ) : (
          clubs.map((club) => {
            const memberCount = displayMemberCount(club)
            const isMine = club.organizerId === ME_ID
            return (
              <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                    {isMine && <span className="bj-chip bj-chip--active">내가 만든 모임</span>}
                  </div>
                  <p className="bj-caption">{club.description}</p>
                </div>
                <p className="bj-caption" style={{ fontWeight: 700, flexShrink: 0 }}>{memberCount}/{club.capacity}</p>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}
