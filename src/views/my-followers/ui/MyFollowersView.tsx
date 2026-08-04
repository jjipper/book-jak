'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getFollowerIds, isFollowing, toggleFollow } from '@/features/follow/model/follows'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function MyFollowersView() {
  const [followerIds, setFollowerIds] = useState<string[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => {
    const ids = getFollowerIds()
    setFollowerIds(ids)
    setFollowingIds(ids.filter((id) => isFollowing(id)))
  }, [])

  function handleToggleFollow(id: string) {
    const nowFollowing = toggleFollow(id)
    setFollowingIds((prev) => (nowFollowing ? [...prev, id] : prev.filter((i) => i !== id)))
  }

  const people = MOCK_PEOPLE.filter((p) => followerIds.includes(p.id))

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">팔로워</span>
      </header>

      <div className="bj-content">
        {people.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 나를 팔로우한 사람이 없어요</p>
            <p className="bj-caption">활동을 남기면 나를 팔로우하는 사람이 생겨요</p>
          </div>
        ) : (
          people.map((person) => {
            const type = READING_TYPES[person.typeCode]
            const following = followingIds.includes(person.id)
            return (
              <div key={person.id} className="bj-row">
                <Link href={`/people/${person.id}`} className="bj-people-link">
                  <div className="bj-people-thumb">
                    <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                  </div>
                  <div className="bj-flex-1">
                    <p className="bj-body bj-bold bj-body--sm">{person.nickname}</p>
                    <p className="bj-caption">{type.name}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(person.id)}
                  className={`bj-chip${following ? ' bj-chip--active bj-follow-chip--active' : ' bj-follow-chip'}`}
                >
                  {following ? '팔로잉' : '팔로우'}
                </button>
              </div>
            )
          })
        )}
      </div>
      </div>
    </main>
  )
}
