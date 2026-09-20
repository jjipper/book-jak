'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadPeopleByIds } from '@/entities/person/api/personRemote'
import type { Person } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getFollowerIds, getFollowingIds, toggleFollow } from '@/features/follow/model/follows'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'

export default function MyFollowersView() {
  const [people, setPeople] = useState<Person[]>([])
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    async function load() {
      const [followerIds, following] = await Promise.all([getFollowerIds(), getFollowingIds()])
      setPeople(await loadPeopleByIds(followerIds))
      setFollowingIds(following.filter((id) => followerIds.includes(id)))
    }
    void load()
  }, [])

  function handleToggleFollow(id: string) {
    requireAuth(() => {
      void (async () => {
        const nowFollowing = await toggleFollow(id)
        setFollowingIds((prev) => (nowFollowing ? [...prev, id] : prev.filter((i) => i !== id)))
      })()
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">팔로워</span>
      </header>

      <div className="bj-content">
        {people.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 나를 팔로우한 사람이 없어요</p>
            <p className="bj-caption">활동을 남기면 나를 팔로우하는 사람이 생겨요</p>
          </div>
        ) : (
          people.map((person) => {
            const type = person.typeCode ? READING_TYPES[person.typeCode] : null
            const following = followingIds.includes(person.id)
            return (
              <div key={person.id} className="bj-row">
                <Link href={`/people/${person.id}`} className="bj-people-link">
                  <div className="bj-people-thumb">
                    {type && <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />}
                  </div>
                  <div className="bj-flex-1">
                    <p className="bj-body bj-bold bj-body--sm">{person.nickname}</p>
                    <p className="bj-caption">{type?.name ?? '유형 미진단'}</p>
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
      <LoginGateSheet open={showGate} onClose={closeGate} next="/my/followers" />
      </div>
    </main>
  )
}
