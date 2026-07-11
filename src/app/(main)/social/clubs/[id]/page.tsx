'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadClub, displayMemberCount, isJoined, joinClub, leaveClub } from '@/lib/clubs'
import { resolveAuthor, ME_ID } from '@/lib/author'
import type { BookClub } from '@/data/clubs'

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>()
  const [club, setClub] = useState<BookClub | null>(null)
  const [joined, setJoined] = useState(false)

  useEffect(() => {
    const c = loadClub(params.id) ?? null
    setClub(c)
    setJoined(isJoined(params.id))
  }, [params.id])

  if (!club) {
    return (
      <main style={{ minHeight: '100dvh', padding: '52px 20px' }}>
        <Link href="/social/clubs" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
      </main>
    )
  }

  const organizer = resolveAuthor(club.organizerId)
  const memberCount = displayMemberCount(club)
  const isFull = memberCount >= club.capacity
  const isMine = club.organizerId === ME_ID

  function handleToggleJoin() {
    if (joined) {
      leaveClub(club!.id)
      setJoined(false)
    } else {
      joinClub(club!.id)
      setJoined(true)
    }
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social/clubs" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">모임 상세</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <p className="bj-h1">{club.name}</p>
            <span className="bj-chip">{club.format}</span>
          </div>
          <p className="bj-body" style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>{club.description}</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
          </div>
          <div className="bj-row">
            <div style={{ flex: 1 }}>
              <p className="bj-caption">주최자</p>
              <p className="bj-body" style={{ fontSize: 14, fontWeight: 600 }}>{organizer.nickname}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="bj-caption">인원</p>
              <p className="bj-body" style={{ fontSize: 14, fontWeight: 600 }}>{memberCount}/{club.capacity}</p>
            </div>
          </div>
        </div>

        {isMine ? (
          <p className="bj-caption" style={{ textAlign: 'center' }}>내가 만든 모임이에요</p>
        ) : (
          <button
            type="button"
            onClick={handleToggleJoin}
            disabled={!joined && isFull}
            className={`bj-btn ${joined ? '' : 'bj-btn--primary'} bj-btn--block`}
            style={{ padding: '14px 0', opacity: !joined && isFull ? 0.4 : 1, cursor: !joined && isFull ? 'not-allowed' : 'pointer' }}
          >
            {joined ? '참여 취소하기' : isFull ? '정원이 찼어요' : '참여하기'}
          </button>
        )}
      </div>
    </main>
  )
}
