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
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">팔로워</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {people.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 나를 팔로우한 사람이 없어요</p>
            <p className="bj-caption">활동을 남기면 나를 팔로우하는 사람이 생겨요</p>
          </div>
        ) : (
          people.map((person) => {
            const type = READING_TYPES[person.typeCode]
            const following = followingIds.includes(person.id)
            return (
              <div key={person.id} className="bj-row">
                <Link href={`/people/${person.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0, textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ width: 44, flexShrink: 0 }}>
                    <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>{person.nickname}</p>
                    <p className="bj-caption">{type.name}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleToggleFollow(person.id)}
                  className={`bj-chip${following ? ' bj-chip--active' : ''}`}
                  style={{ border: following ? undefined : '1px solid var(--color-border-strong)', cursor: 'pointer' }}
                >
                  {following ? '팔로잉' : '팔로우'}
                </button>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
