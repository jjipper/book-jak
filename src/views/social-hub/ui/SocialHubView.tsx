'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount } from '@/entities/club/model/clubActions'
import { loadRecRequests } from '@/entities/recommendation/api/recommendationsRemote'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import type { BookClub } from '@/entities/club/model/clubs'
import type { RecRequest, RecSort } from '@/entities/recommendation/model/recommendations'
import TypeBadge from '@/shared/ui/TypeBadge'

type HubTab = 'clubs' | 'recommend'

function ClubCard({ club }: { club: BookClub }) {
  const memberCount = displayMemberCount(club)
  const isFull = memberCount >= club.capacity
  const organizer = club.organizerId ? resolveAuthor(club.organizerId).nickname : '북작'

  return (
    <Link href={`/social/clubs/${club.id}`} className="bj-event-card bj-unstyled-link">
      <div className="bj-event-card__head">
        {club.isOfficial && <span className="bj-chip bj-chip--active bj-event-card__badge">공식</span>}
        <span className="bj-chip">{club.format}</span>
        {isFull && <span className="bj-chip bj-event-card__full">마감</span>}
      </div>
      <p className="bj-body bj-bold bj-event-card__title">{club.name}</p>
      <p className="bj-caption bj-event-card__desc">{club.description}</p>
      <p className="bj-caption">
        {organizer} 주최 · {memberCount}/{club.capacity}명
      </p>
    </Link>
  )
}

function RecRequestCard({ req }: { req: RecRequest }) {
  return (
    <div className="bj-event-card">
      <div className="bj-event-card__head">
        <span className={`bj-chip${req.isOpen ? ' bj-chip--active' : ''} bj-event-card__badge`}>
          {req.isOpen ? '추천 받는 중' : '닫힘'}
        </span>
      </div>
      <Link href={`/social/recommend/${req.id}`} className="bj-unstyled-link">
        <p className="bj-body bj-bold bj-event-card__title">{req.title}</p>
        {req.mood && <p className="bj-caption bj-event-card__desc">{req.mood}</p>}
      </Link>
      <div className="bj-meta-row">
        <Link href={`/people/${req.authorId}`} className="bj-post-card__author-link">
          <TypeBadge code={req.typeCode} />
          <span className="bj-caption bj-bold">{req.authorNickname}</span>
        </Link>
        <span className="bj-caption">추천 {req.recCount} · 읽는 중 {req.readerCount}</span>
      </div>
    </div>
  )
}

function ClubsTab() {
  const [clubs, setClubs] = useState<BookClub[] | null>(null)
  useEffect(() => { void loadClubs().then(setClubs) }, [])

  return (
    <section>
      <div className="bj-section__head">
        <p className="bj-h2">모임</p>
        <Link href="/social/clubs/new" className="bj-section__action">+ 만들기</Link>
      </div>
      {clubs === null ? (
        <p className="bj-caption bj-text-muted">불러오는 중…</p>
      ) : clubs.length > 0 ? (
        <div className="bj-list bj-list--lg-grid-2 bj-col-10">
          {clubs.map((c) => <ClubCard key={c.id} club={c} />)}
        </div>
      ) : (
        <div className="bj-search-empty">
          <p className="bj-body bj-text-muted bj-mb-12">아직 모임이 없어요</p>
          <Link href="/social/clubs/new" className="bj-btn bj-btn--primary bj-btn--cta">첫 모임 만들기</Link>
        </div>
      )}
    </section>
  )
}

function RecommendTab() {
  const [sort, setSort] = useState<RecSort>('latest')
  // 결과를 그 결과를 낳은 정렬과 함께 담아, 정렬이 바뀌면 그 자체로 '불러오는 중'이 되게 한다
  const [result, setResult] = useState<{ sort: RecSort; list: RecRequest[] } | null>(null)
  const list = result?.sort === sort ? result.list : null

  useEffect(() => {
    void loadRecRequests(sort).then((l) => setResult({ sort, list: l }))
  }, [sort])

  return (
    <section>
      <div className="bj-section__head">
        <div className="bj-meta-row">
          {(['latest', 'popular'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              className={`bj-chip${sort === s ? ' bj-chip--active' : ''}`}
            >
              {s === 'latest' ? '최신순' : '인기순'}
            </button>
          ))}
        </div>
        <Link href="/social/recommend/new" className="bj-section__action">+ 만들기</Link>
      </div>
      {list === null ? (
        <p className="bj-caption bj-text-muted">불러오는 중…</p>
      ) : list.length > 0 ? (
        <div className="bj-list bj-list--lg-grid-2 bj-col-10">
          {list.map((r) => <RecRequestCard key={r.id} req={r} />)}
        </div>
      ) : (
        <div className="bj-search-empty">
          <p className="bj-body bj-text-muted bj-mb-12">아직 플레이리스트가 없어요</p>
          <Link href="/social/recommend/new" className="bj-btn bj-btn--primary bj-btn--cta">플레이리스트 만들기</Link>
        </div>
      )}
    </section>
  )
}

export default function SocialHubView({ initialTab = 'clubs' }: { initialTab?: HubTab }) {
  const [tab, setTab] = useState<HubTab>(initialTab)

  return (
    <main className="bj-shell bj-shell--pb">
      <div className="bj-frame">
        <header className="bj-page-head">
          <span className="bj-display bj-display--lg">모임</span>
          <p className="bj-caption">함께 읽고, 서로 권하고</p>
        </header>

        <div className="bj-col-16">
          <div className="bj-choice-row" role="tablist">
            {(['clubs', 'recommend'] as const).map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`bj-choice bj-choice--flex bj-text-center${tab === t ? ' is-active' : ''}`}
              >
                {t === 'clubs' ? '모임' : '책 추천'}
              </button>
            ))}
          </div>

          {tab === 'clubs' ? <ClubsTab /> : <RecommendTab />}
        </div>
      </div>
    </main>
  )
}
