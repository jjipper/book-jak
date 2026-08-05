'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { loadClub, displayMemberCount, isJoined, joinClub, leaveClub } from '@/entities/club/model/clubActions'
import { resolveAuthor, ME_ID } from '@/features/resolve-author/model/author'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import type { BookClub } from '@/entities/club/model/clubs'

export default function SocialClubDetailView() {
  const params = useParams<{ id: string }>()
  const [club, setClub] = useState<BookClub | null>(null)
  const [joined, setJoined] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    const c = loadClub(params.id) ?? null
    setClub(c)
    setJoined(isJoined(params.id))
  }, [params.id])

  if (!club) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-subpage-loading">
            <Link href="/social/clubs" className="bj-icon-btn">←</Link>
          </div>
        </div>
      </main>
    )
  }

  const organizer = resolveAuthor(club.organizerId)
  const memberCount = displayMemberCount(club)
  const isFull = memberCount >= club.capacity
  const isMine = club.organizerId === ME_ID

  function handleToggleJoin() {
    requireAuth(() => {
      if (joined) {
        leaveClub(club!.id)
        setJoined(false)
      } else {
        joinClub(club!.id)
        setJoined(true)
      }
    })
  }

  return (
    <main className="bj-shell">
      {club.illust && (
        <div className="bj-club-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/illust/club/${club.illust}.png`}
            alt={club.name}
            className="bj-club-hero__img"
          />
          <div className="bj-club-hero__fade" />
        </div>
      )}

      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social/clubs" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">모임 상세</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-card">
          <div className="bj-meta-row bj-mb-8">
            <p className="bj-h1">{club.name}</p>
            <span className="bj-chip">{club.format}</span>
          </div>
          <p className="bj-body bj-text-muted bj-mb-12">{club.description}</p>
          <div className="bj-tag-group bj-mb-16">
            {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
          </div>
          <div className="bj-row">
            <div className="bj-flex-1">
              <p className="bj-caption">주최자</p>
              <p className="bj-body bj-discuss-text bj-semibold">{organizer.nickname}</p>
            </div>
            <div className="bj-text-right">
              <p className="bj-caption">인원</p>
              <p className="bj-body bj-discuss-text bj-semibold">{memberCount}/{club.capacity}</p>
            </div>
          </div>
        </div>

        {isMine ? (
          <p className="bj-caption bj-text-center">내가 만든 모임이에요</p>
        ) : (
          <button
            type="button"
            onClick={handleToggleJoin}
            disabled={!joined && isFull}
            className={`bj-btn ${joined ? '' : 'bj-btn--primary'} bj-btn--block bj-btn--tall`}
            style={{ opacity: !joined && isFull ? 0.4 : 1 }}
          >
            {joined ? '참여 취소하기' : isFull ? '정원이 찼어요' : '참여하기'}
          </button>
        )}
      </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/clubs/${params.id}`} />
    </main>
  )
}
