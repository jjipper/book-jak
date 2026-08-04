'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getFollowingIds, unfollowPerson } from '@/features/follow/model/follows'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function MyFollowingView() {
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => { setFollowingIds(getFollowingIds()) }, [])

  const people = MOCK_PEOPLE.filter((p) => followingIds.includes(p.id))

  function handleUnfollow(id: string) {
    unfollowPerson(id)
    setFollowingIds((prev) => prev.filter((i) => i !== id))
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">팔로잉</span>
      </header>

      <div className="bj-content">
        {people.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 팔로우한 사람이 없어요</p>
            <p className="bj-caption bj-mb-16">취향 맞는 사람을 찾아 팔로우해보세요</p>
            <Link href="/social/people" className="bj-btn bj-btn--primary bj-btn--cta">
              취향 맞는 사람 찾기
            </Link>
          </div>
        ) : (
          people.map((person) => {
            const type = READING_TYPES[person.typeCode]
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
                  onClick={() => handleUnfollow(person.id)}
                  className="bj-chip bj-chip--active bj-follow-chip--active"
                >
                  팔로잉
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
