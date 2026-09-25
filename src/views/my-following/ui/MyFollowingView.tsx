'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadPeopleByIds } from '@/entities/person/api/personRemote'
import type { Person } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { getFollowingIds, unfollowPerson } from '@/features/follow/model/follows'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import BackLink from '@/shared/ui/BackLink'

export default function MyFollowingView() {
  const [people, setPeople] = useState<Person[] | null>(null)

  useEffect(() => {
    async function load() {
      setPeople(await loadPeopleByIds(await getFollowingIds()))
    }
    void load()
  }, [])

  async function handleUnfollow(id: string) {
    await unfollowPerson(id)
    setPeople((prev) => prev?.filter((p) => p.id !== id) ?? null)
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">팔로잉</span>
      </header>

      <div className="bj-content">
        {people === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : people.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 팔로우한 사람이 없어요</p>
            <p className="bj-caption bj-mb-16">취향 맞는 사람을 찾아 팔로우해보세요</p>
            <Link href="/social/people" className="bj-btn bj-btn--primary bj-btn--cta">
              취향 맞는 사람 찾기
            </Link>
          </div>
        ) : (
          people.map((person) => {
            const type = person.typeCode ? READING_TYPES[person.typeCode] : null
            return (
              <div key={person.id} className="bj-row">
                <Link href={`/people/${person.id}`} className="bj-people-link">
                  <div className="bj-people-thumb">
                    {type && <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />}
                  </div>
                  <div className="bj-flex-1">
                    <p className="bj-body bj-bold bj-body--sm">{person.nickname}</p>
                    <p className="bj-caption">{type?.name ?? '아직 테스트 전'}</p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => void handleUnfollow(person.id)}
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
