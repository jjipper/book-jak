'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getMatchedPeople, type MatchedPerson } from '@/features/people-match/model/peopleMatch'
import { affinityLabel } from '@/entities/reading-type/model/affinity'
import { isFollowing, toggleFollow } from '@/features/follow/model/follows'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import { useMounted } from '@/shared/lib/useMounted'

export default function SocialPeopleView() {
  const mounted = useMounted()
  const ranked: MatchedPerson[] = useMemo(() => (mounted ? getMatchedPeople() : []), [mounted])
  const hasResult = !mounted || ranked.length > 0
  // 팔로우 여부는 저장소가 원본이고, 이번 화면에서 누른 것만 덮어쓴다
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const followingIds = useMemo(
    () => ranked.map((m) => m.person.id).filter((id) => toggled[id] ?? isFollowing(id)),
    [ranked, toggled],
  )
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleToggleFollow(id: string) {
    requireAuth(() => {
      void (async () => {
        const nowFollowing = await toggleFollow(id)
        setToggled((prev) => ({ ...prev, [id]: nowFollowing }))
      })()
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">취향 맞는 사람 찾기</span>
      </header>

      <div className="bj-content--new">
        {!hasResult ? (
          <div className="bj-empty-card">
            <p className="bj-h1 bj-mb-10">취향 맞는 사람 찾기</p>
            <p className="bj-body bj-text-muted bj-mb-20">
              독서유형 테스트를 먼저 하면<br />나와 취향 맞는 사람을 보여드려요
            </p>
            <Link href="/test" className="bj-btn bj-btn--primary bj-btn--block">
              독서유형 테스트 하러 가기
            </Link>
          </div>
        ) : (
          <>
            <p className="bj-body bj-text-muted bj-text-sm">
              내 독서유형과 얼마나 잘 맞는지 순서대로 보여드려요
            </p>

            <div className="bj-col-10">
              {ranked.map(({ person, affinity, sharedTags }) => {
                const type = READING_TYPES[person.typeCode]
                const following = followingIds.includes(person.id)
                return (
                  <div key={person.id} className="bj-row bj-row--top">
                    <Link
                      href={`/people/${person.id}`}
                      className="bj-people-link--social"
                    >
                      <div className="bj-people-avatar">
                        <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                      </div>
                      <div className="bj-flex-1">
                        <div className="bj-meta-row bj-mb-2">
                          <p className="bj-body bj-bold bj-discuss-text">{person.nickname}</p>
                          <span className="bj-caption">· {type.name}</span>
                        </div>
                        <p className="bj-caption bj-truncate">
                          {person.bio}
                        </p>
                        {sharedTags.length > 0 && (
                          <p className="bj-caption bj-shared-tags">
                            공통 관심사 · {sharedTags.join(', ')}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="bj-affinity-col">
                      <div className="bj-text-center">
                        <p className="bj-display bj-display--lg bj-affinity-pct">
                          {affinity}%
                        </p>
                        <p className="bj-caption bj-caption--xs">{affinityLabel(affinity)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(person.id)}
                        className={`bj-chip${following ? ' bj-chip--active' : ' bj-chip--outline-strong'}`}
                      >
                        {following ? '팔로잉' : '팔로우'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next="/social/people" />
      </div>
    </main>
  )
}
