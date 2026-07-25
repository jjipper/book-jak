'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getMatchedPeople, type MatchedPerson } from '@/features/people-match/model/peopleMatch'
import { affinityLabel } from '@/entities/reading-type/model/affinity'
import { isFollowing, toggleFollow } from '@/features/follow/model/follows'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function SocialPeopleView() {
  const [ranked, setRanked] = useState<MatchedPerson[]>([])
  const [hasResult, setHasResult] = useState(true)
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    const matched = getMatchedPeople()
    setRanked(matched)
    setHasResult(matched.length > 0)
    setFollowingIds(matched.map((m) => m.person.id).filter((id) => isFollowing(id)))
  }, [])

  function handleToggleFollow(id: string) {
    const nowFollowing = toggleFollow(id)
    setFollowingIds((prev) => (nowFollowing ? [...prev, id] : prev.filter((i) => i !== id)))
  }

  return (
    <main style={{ minHeight: '100dvh' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">취향 맞는 사람 찾기</span>
      </header>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {!hasResult ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-h1" style={{ marginBottom: 10 }}>취향 맞는 사람 찾기</p>
            <p className="bj-body" style={{ color: 'var(--color-text-muted)', marginBottom: 20 }}>
              독서유형 테스트를 먼저 하면<br />나와 취향 맞는 사람을 보여드려요
            </p>
            <Link href="/test" className="bj-btn bj-btn--primary bj-btn--block">
              독서유형 테스트 하러 가기
            </Link>
          </div>
        ) : (
          <>
            <p className="bj-body" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
              내 독서유형과 얼마나 잘 맞는지 순서대로 보여드려요
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ranked.map(({ person, affinity, sharedTags }) => {
                const type = READING_TYPES[person.typeCode]
                const following = followingIds.includes(person.id)
                return (
                  <div key={person.id} className="bj-row" style={{ alignItems: 'flex-start' }}>
                    <Link
                      href={`/people/${person.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', display: 'flex', gap: 12, flex: 1, minWidth: 0 }}
                    >
                      <div style={{ width: 48, flexShrink: 0 }}>
                        <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>{person.nickname}</p>
                          <span className="bj-caption">· {type.name}</span>
                        </div>
                        <p className="bj-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {person.bio}
                        </p>
                        {sharedTags.length > 0 && (
                          <p className="bj-caption" style={{ color: 'var(--color-action)', marginTop: 2 }}>
                            공통 관심사 · {sharedTags.join(', ')}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 48 }}>
                      <div style={{ textAlign: 'center' }}>
                        <p className="bj-display bj-display--lg" style={{ fontSize: 18, color: 'var(--color-action)' }}>
                          {affinity}%
                        </p>
                        <p className="bj-caption" style={{ fontSize: 10 }}>{affinityLabel(affinity)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleFollow(person.id)}
                        className={`bj-chip${following ? ' bj-chip--active' : ''}`}
                        style={{ border: following ? undefined : '1px solid var(--color-border-strong)', cursor: 'pointer' }}
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
    </main>
  )
}
