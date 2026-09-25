'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadClubs, displayMemberCount, getInterestedIds } from '@/entities/club/model/clubActions'
import { loadRecRequests } from '@/entities/recommendation/api/recommendationsRemote'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import ClubInterestButton from '@/entities/club/ui/ClubInterestButton'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { clubIllust, type BookClub } from '@/entities/club/model/clubs'
import { REC_FILTER_LABEL, REC_KIND_LABEL, type RecFilter, type RecRequest, type RecSort } from '@/entities/recommendation/model/recommendations'
import TypeBadge from '@/shared/ui/TypeBadge'
import Icon from '@/shared/ui/Icon'

type HubTab = 'clubs' | 'recommend'

function ClubCard({ club, interested, onInterest }: {
  club: BookClub
  interested: boolean
  onInterest: (next: boolean) => void
}) {
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
      <div className="bj-club-card__body">
        <IllustPlaceholder
          code={clubIllust(club)}
          alt=""
          aspectRatio="1 / 1"
          className="bj-club-thumb"
          background="var(--color-control-surface)"
        />
        <div className="bj-flex-1">
          <p className="bj-body bj-bold bj-event-card__title">{club.name}</p>
          <p className="bj-caption bj-event-card__desc">{club.description}</p>
        </div>
      </div>
      <div className="bj-meta-row">
        <p className="bj-caption bj-flex-1">{organizer} 주최</p>
        <p className="bj-caption">{memberCount}/{club.capacity}명</p>
        <ClubInterestButton clubId={club.id} interested={interested} onChange={onInterest} />
      </div>
    </Link>
  )
}

// 한 목록에 두 종류가 섞이므로 종류 칩을 맨 앞에 세우고 색까지 갈라 놓는다 (share만 주황 채움).
function RecRequestCard({ req }: { req: RecRequest }) {
  const isShare = req.kind === 'share'
  return (
    <div className="bj-event-card">
      <div className="bj-event-card__head">
        <span className={`bj-chip${isShare ? ' bj-chip--active' : ''} bj-event-card__badge`}>
          {REC_KIND_LABEL[req.kind]}
        </span>
        {!isShare && !req.isOpen && <span className="bj-chip bj-chip--done bj-event-card__badge">닫힘</span>}
      </div>
      <Link href={`/social/recommend/${req.id}`} className="bj-unstyled-link">
        <p className="bj-h2 bj-event-card__title--lead">{req.title}</p>
        {req.mood && <p className="bj-caption bj-event-card__desc">{req.mood}</p>}
      </Link>
      <div className="bj-meta-row">
        <Link href={`/people/${req.authorId}`} className="bj-post-card__author-link">
          <TypeBadge code={req.typeCode} />
          <span className="bj-caption bj-text-muted">{req.authorNickname}</span>
        </Link>
        <span className="bj-caption bj-rec-card__stats">책 {req.recCount}권</span>
      </div>
    </div>
  )
}

function ClubsTab() {
  const [clubs, setClubs] = useState<BookClub[] | null>(null)
  const [interested, setInterested] = useState<string[]>([])
  useEffect(() => {
    void loadClubs().then(setClubs)
    void getInterestedIds().then(setInterested)
  }, [])

  return (
    <section>
      <div className="bj-section__head">
        <p className="bj-h2">모임</p>
      </div>
      {clubs === null ? (
        <p className="bj-caption bj-text-muted">불러오는 중…</p>
      ) : clubs.length > 0 ? (
        <div className="bj-list bj-list--lg-grid-2 bj-col-10">
          {clubs.map((c) => (
            <ClubCard
              key={c.id}
              club={c}
              interested={interested.includes(c.id)}
              onInterest={(next) =>
                setInterested((prev) => (next ? [...prev, c.id] : prev.filter((id) => id !== c.id)))
              }
            />
          ))}
        </div>
      ) : (
        <div className="bj-search-empty">
          <p className="bj-body bj-text-muted bj-mb-12">아직 열린 모임이 없어요</p>
          <Link href="/social/clubs/new" className="bj-btn bj-btn--primary bj-btn--cta">모임 만들기</Link>
        </div>
      )}
    </section>
  )
}

function RecommendTab({ filter, setFilter }: { filter: RecFilter; setFilter: (f: RecFilter) => void }) {
  const [sort, setSort] = useState<RecSort>('latest')
  // 결과를 그 결과를 낳은 조건과 함께 담아, 조건이 바뀌면 그 자체로 '불러오는 중'이 되게 한다
  const [result, setResult] = useState<{ sort: RecSort; filter: RecFilter; list: RecRequest[] } | null>(null)
  const list = result?.sort === sort && result.filter === filter ? result.list : null

  useEffect(() => {
    void loadRecRequests(sort, filter).then((l) => setResult({ sort, filter, list: l }))
  }, [sort, filter])

  return (
    <section className="bj-col-10">
      <div className="bj-section__head">
        <select
          className="bj-select"
          aria-label="추천 종류"
          value={filter}
          onChange={(e) => setFilter(e.target.value as RecFilter)}
        >
          {(['all', 'ask', 'share'] as const).map((f) => (
            <option key={f} value={f}>{REC_FILTER_LABEL[f]}</option>
          ))}
        </select>
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
      </div>
      {list === null ? (
        <p className="bj-caption bj-text-muted">불러오는 중…</p>
      ) : list.length > 0 ? (
        <div className="bj-list bj-list--lg-grid-2 bj-col-10">
          {list.map((r) => <RecRequestCard key={r.id} req={r} />)}
        </div>
      ) : (
        <div className="bj-search-empty">
          <p className="bj-body bj-text-muted bj-mb-12">아직 올라온 추천이 없어요</p>
          <Link href={recommendNewHref(filter)} className="bj-btn bj-btn--primary bj-btn--cta">추천 쓰기</Link>
        </div>
      )}
    </section>
  )
}

// 전체를 보고 있으면 종류를 고른 게 아니므로 작성 화면 기본값(추천받기)에 맡긴다
function recommendNewHref(filter: RecFilter): string {
  return filter === 'all' ? '/social/recommend/new' : `/social/recommend/new?kind=${filter}`
}

export default function SocialHubView({ initialTab = 'clubs' }: { initialTab?: HubTab }) {
  const [tab, setTab] = useState<HubTab>(initialTab)
  // 목록 필터가 FAB의 기본값이 되므로 탭 바깥에서 들고 있는다 (작성 화면에서 바꿀 수 있다)
  const [filter, setFilter] = useState<RecFilter>('all')
  const newHref = tab === 'clubs' ? '/social/clubs/new' : recommendNewHref(filter)

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
                {t === 'clubs' ? '모임' : '추천'}
              </button>
            ))}
          </div>

          {tab === 'clubs' ? <ClubsTab /> : <RecommendTab filter={filter} setFilter={setFilter} />}
        </div>
      </div>

      {/* 만들기 FAB — 보고 있는 필터가 작성 화면의 기본값이 된다 */}
      <Link href={newHref} className="bj-fab" aria-label={tab === 'clubs' ? '모임 만들기' : '추천 쓰기'}>
        <Icon name="plus" size={24} />
      </Link>
    </main>
  )
}
