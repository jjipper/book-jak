'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MOCK_PEOPLE } from '@/data/people'
import { READING_TYPES } from '@/data/readingTypes'
import { getFollowingIds, unfollowPerson } from '@/lib/follows'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

export default function MyFollowingPage() {
  const [followingIds, setFollowingIds] = useState<string[]>([])

  useEffect(() => { setFollowingIds(getFollowingIds()) }, [])

  const people = MOCK_PEOPLE.filter((p) => followingIds.includes(p.id))

  function handleUnfollow(id: string) {
    unfollowPerson(id)
    setFollowingIds((prev) => prev.filter((i) => i !== id))
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">팔로잉</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {people.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 팔로우한 사람이 없어요</p>
            <p className="bj-caption" style={{ marginBottom: 16 }}>취향 맞는 사람을 찾아 팔로우해보세요</p>
            <Link href="/social/people" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              취향 맞는 사람 찾기
            </Link>
          </div>
        ) : (
          people.map((person) => {
            const type = READING_TYPES[person.typeCode]
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
                  onClick={() => handleUnfollow(person.id)}
                  className="bj-chip bj-chip--active"
                  style={{ cursor: 'pointer' }}
                >
                  팔로잉
                </button>
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
