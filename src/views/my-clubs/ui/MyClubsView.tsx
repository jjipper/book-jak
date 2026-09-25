'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount, getJoinedIds, getInterestedIds } from '@/entities/club/model/clubActions'
import ClubInterestButton from '@/entities/club/ui/ClubInterestButton'
import { getMyId } from '@/entities/user/model/profile'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { clubIllust, type BookClub } from '@/entities/club/model/clubs'
import BackLink from '@/shared/ui/BackLink'

type Tab = 'joined' | 'interested'

export default function MyClubsView() {
  const [tab, setTab] = useState<Tab>('joined')
  const [all, setAll] = useState<BookClub[] | null>(null)
  const [joinedIds, setJoinedIds] = useState<string[]>([])
  const [interestedIds, setInterestedIds] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      const [joined, interested, allClubs] = await Promise.all([getJoinedIds(), getInterestedIds(), loadClubs()])
      setJoinedIds(joined)
      setInterestedIds(interested)
      setAll(allClubs)
    }
    void load()
  }, [])

  const myId = getMyId()
  const clubs = all === null
    ? null
    : tab === 'joined'
      ? all.filter((c) => c.organizerId === myId || joinedIds.includes(c.id))
      // 관심 목록은 담은 순서(최신순)를 그대로 지킨다
      : interestedIds.map((id) => all.find((c) => c.id === id)).filter((c): c is BookClub => !!c)

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">모임</span>
      </header>

      <div className="bj-content">
        <div className="bj-choice-row" role="tablist">
          {(['joined', 'interested'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={`bj-choice bj-choice--flex bj-text-center${tab === t ? ' is-active' : ''}`}
            >
              {t === 'joined' ? '참여한 모임' : '관심 모임'}
            </button>
          ))}
        </div>

        {clubs === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : clubs.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">
              {tab === 'joined' ? '아직 참여한 모임이 없어요' : '아직 관심 모임이 없어요'}
            </p>
            <Link href="/social" className="bj-btn bj-btn--primary bj-btn--cta">
              모임 둘러보기
            </Link>
          </div>
        ) : (
          clubs.map((club) => {
            const memberCount = displayMemberCount(club)
            const isMine = club.organizerId === myId
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
                    <p className="bj-body bj-bold bj-body--sm">{club.name}</p>
                    <span className="bj-chip">{club.format}</span>
                    {club.isOfficial && <span className="bj-chip bj-chip--active">공식</span>}
                    {isMine && <span className="bj-chip bj-chip--active">내가 만든 모임</span>}
                  </div>
                  <p className="bj-caption bj-clamp-3">{club.description}</p>
                </div>
                <div className="bj-club-count">
                  <p className="bj-caption bj-bold bj-mb-4">{memberCount}/{club.capacity}</p>
                  {tab === 'interested' && (
                    <ClubInterestButton
                      clubId={club.id}
                      interested={interestedIds.includes(club.id)}
                      onChange={(next) =>
                        setInterestedIds((prev) =>
                          next ? [club.id, ...prev] : prev.filter((id) => id !== club.id),
                        )
                      }
                    />
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
      </div>
    </main>
  )
}
