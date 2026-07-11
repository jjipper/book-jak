'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount } from '@/lib/clubs'
import { resolveAuthor } from '@/lib/author'
import type { BookClub } from '@/data/clubs'

export default function ClubsListPage() {
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => { setClubs(loadClubs()) }, [])

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">책 모임</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Link href="/social/clubs/new" className="bj-btn bj-btn--primary bj-btn--block" style={{ padding: '14px 0', textDecoration: 'none' }}>
          모임 만들기
        </Link>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {clubs.map((club) => {
            const organizer = resolveAuthor(club.organizerId)
            const memberCount = displayMemberCount(club)
            const isFull = memberCount >= club.capacity
            return (
              <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                  </div>
                  <p className="bj-caption" style={{ marginBottom: 6 }}>{club.description}</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <p className="bj-caption" style={{ fontWeight: 700, color: isFull ? 'var(--color-text-hint)' : 'var(--color-action)' }}>
                    {memberCount}/{club.capacity}
                  </p>
                  <p className="bj-caption" style={{ fontSize: 10 }}>{organizer.nickname}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
