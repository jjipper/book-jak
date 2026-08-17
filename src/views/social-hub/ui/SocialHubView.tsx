'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadOfficialEvents, loadUserEvents, isJoinedEvent, joinEvent, leaveEvent } from '@/entities/event/api/eventsRemote'
import { loadClubs, displayMemberCount } from '@/entities/club/model/clubActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import type { BookEvent } from '@/entities/event/model/events'
import type { BookClub } from '@/entities/club/model/clubs'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import EventCalendar from './EventCalendar'
import './SocialHubView.css'

function formatEventDate(iso: string | null): string {
  if (!iso) return '날짜 미정'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function OfficialEventCard({ event }: { event: BookEvent }) {
  const [joined, setJoined] = useState(() => isJoinedEvent(event.id))
  const [count, setCount] = useState(event.participantCount)
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const isFull = event.maxParticipants != null && count >= event.maxParticipants

  function handleJoin() {
    requireAuth(async () => {
      if (joined) {
        await leaveEvent(event.id)
        setJoined(false)
        setCount((c) => Math.max(0, c - 1))
      } else if (!isFull) {
        await joinEvent(event.id)
        setJoined(true)
        setCount((c) => c + 1)
      }
    })
  }

  return (
    <>
      <div className="bj-event-card bj-event-card--official">
        <div className="bj-event-card__head">
          <span className="bj-chip bj-chip--active bj-event-card__badge">공식</span>
          <span className={`bj-chip bj-event-card__loc${event.locationType === 'online' ? ' bj-chip--online' : ''}`}>
            {event.locationType === 'online' ? '온라인' : '오프라인'}
          </span>
        </div>
        <p className="bj-h2 bj-event-card__title">{event.title}</p>
        <p className="bj-body bj-event-card__desc">{event.description}</p>
        <div className="bj-event-card__meta">
          <span className="bj-caption">{formatEventDate(event.eventDate)}</span>
          {event.location && <span className="bj-caption">{event.location}</span>}
          <span className="bj-caption">
            {count}{event.maxParticipants != null ? `/${event.maxParticipants}` : ''}명 참여
          </span>
        </div>
        <button
          type="button"
          onClick={handleJoin}
          className={`bj-btn${joined ? '' : ' bj-btn--primary'} bj-event-card__join-btn`}
          disabled={!joined && isFull}
        >
          {joined ? '참가 취소' : isFull ? '마감' : '참가하기'}
        </button>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next="/social" />
    </>
  )
}

function ClubCard({ club }: { club: BookClub }) {
  const organizer = resolveAuthor(club.organizerId)
  const memberCount = displayMemberCount(club)
  const isFull = memberCount >= club.capacity

  return (
    <Link href={`/social/clubs/${club.id}`} className="bj-event-card bj-unstyled-link">
      <div className="bj-event-card__head">
        <span className="bj-chip">{club.format}</span>
        {isFull && <span className="bj-chip bj-event-card__full">마감</span>}
      </div>
      <p className="bj-body bj-bold bj-event-card__title">{club.name}</p>
      <p className="bj-caption bj-event-card__desc">{club.description}</p>
      <p className="bj-caption">
        {organizer.nickname} 주최 · {memberCount}/{club.capacity}명
      </p>
    </Link>
  )
}

export default function SocialHubView() {
  const [officialEvents, setOfficialEvents] = useState<BookEvent[]>([])
  const [userEvents, setUserEvents] = useState<BookEvent[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])

  useEffect(() => {
    async function load() {
      const [official, user, clubList] = await Promise.all([
        loadOfficialEvents(),
        loadUserEvents(),
        loadClubs(),
      ])
      setOfficialEvents(official)
      setUserEvents(user)
      setClubs(clubList)
    }
    void load()
  }, [])

  // 사용자 이벤트 + 모임을 함께 표시 (최신순)
  const communityItems = [
    ...userEvents.map((e) => ({ type: 'event' as const, data: e, ts: e.eventDate ? new Date(e.eventDate).getTime() : 0 })),
    ...clubs.map((c) => ({ type: 'club' as const, data: c, ts: 0 })),
  ]

  return (
    <main className="bj-shell bj-shell--pb">
      <div className="bj-frame">
        <header className="bj-hub-header">
          <span className="bj-display bj-display--lg">모임</span>
        </header>

        <div className="bj-col-28">
          {/* 공식 이벤트 */}
          <section>
            <div className="bj-section__head">
              <p className="bj-h2">북작 공식 이벤트</p>
            </div>
            {officialEvents.length > 0 ? (
              <div className="bj-col-14">
                {officialEvents.map((e) => (
                  <OfficialEventCard key={e.id} event={e} />
                ))}
              </div>
            ) : (
              <p className="bj-caption bj-text-muted">곧 새 이벤트가 열릴 예정이에요</p>
            )}
          </section>

          {/* 이달 캘린더 */}
          <EventCalendar events={[...officialEvents, ...userEvents]} />

          {/* 사용자 모임 */}
          <section>
            <div className="bj-section__head">
              <p className="bj-h2">모임 열기</p>
              <Link href="/social/clubs/new" className="bj-caption bj-bold">+ 만들기</Link>
            </div>
            {communityItems.length > 0 ? (
              <div className="bj-list bj-list--lg-grid-2 bj-col-10">
                {communityItems.map((item) =>
                  item.type === 'club' ? (
                    <ClubCard key={item.data.id} club={item.data as BookClub} />
                  ) : (
                    <div key={item.data.id} className="bj-event-card">
                      <p className="bj-body bj-bold">{(item.data as BookEvent).title}</p>
                      <p className="bj-caption">{formatEventDate((item.data as BookEvent).eventDate)}</p>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bj-search-empty">
                <p className="bj-body bj-text-muted">아직 모임이 없어요</p>
                <Link href="/social/clubs/new" className="bj-btn bj-btn--primary" style={{ display: 'inline-block' }}>
                  첫 모임 만들기
                </Link>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
