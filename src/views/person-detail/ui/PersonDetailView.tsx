'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { BADGE_LIST } from '@/entities/reading-type/model/badges'
import { affinityLabel } from '@/entities/reading-type/model/affinity'
import { getPersonInsight, type PersonInsight } from '@/features/people-match/model/peopleMatch'
import { isFollowing, toggleFollow } from '@/features/follow/model/follows'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function PersonDetailView() {
  const params = useParams<{ id: string }>()
  const person = MOCK_PEOPLE.find((p) => p.id === params.id) ?? null

  const [following, setFollowing] = useState(false)
  const [insight, setInsight] = useState<PersonInsight | null>(null)

  useEffect(() => {
    if (!person) return
    setFollowing(isFollowing(person.id))
    setInsight(getPersonInsight(person))
  }, [person])

  if (!person) {
    return (
      <main style={{ minHeight: '100dvh', padding: '52px 20px' }}>
        <Link href="/social/people" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <p className="bj-body" style={{ marginTop: 20 }}>사람을 찾을 수 없어요</p>
      </main>
    )
  }

  const type = READING_TYPES[person.typeCode]
  const badges = BADGE_LIST.filter((b) => person.badgeKeys.includes(b.key))

  function handleToggleFollow() {
    setFollowing(toggleFollow(person!.id))
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social/people" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">{person.nickname}</span>
      </header>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 프로필 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 64, flexShrink: 0 }}>
            <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="bj-h2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.nickname}</p>
            <p className="bj-caption" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{person.bio}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4 }}>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="bj-body" style={{ fontWeight: 800, fontSize: 16 }}>{person.followingCount}</span>
                <span className="bj-caption" style={{ fontSize: 13 }}>팔로잉</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="bj-body" style={{ fontWeight: 800, fontSize: 16 }}>{person.followerCount}</span>
                <span className="bj-caption" style={{ fontSize: 13 }}>팔로워</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleToggleFollow}
            className={`bj-chip${following ? ' bj-chip--active' : ''}`}
            style={{ border: following ? undefined : '1px solid var(--color-border-strong)', cursor: 'pointer', flexShrink: 0 }}
          >
            {following ? '팔로잉' : '팔로우'}
          </button>
        </div>

        {/* 나와의 궁합 */}
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>나와의 궁합</span>
            <span className="bj-section-label__line" />
          </div>

          {insight?.affinity !== null && insight?.affinity !== undefined ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <p className="bj-display bj-display--xl" style={{ color: 'var(--color-action)', marginBottom: 4 }}>{insight.affinity}%</p>
                <p className="bj-body" style={{ fontWeight: 600 }}>{affinityLabel(insight.affinity)}</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 6 }}>겹치는 취향</p>
                  {insight.sharedTags.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {insight.sharedTags.map((tag) => (
                        <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="bj-caption">아직 겹치는 취향을 못 찾았어요</p>
                  )}
                </div>
                <div>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 6 }}>동시에 좋아하는 책</p>
                  {insight.sharedBooks.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {insight.sharedBooks.map((book) => (
                        <div key={book.id} className="bj-row" style={{ padding: '9px 14px' }}>
                          <p className="bj-body" style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{book.title}</p>
                          <span className="bj-caption">{book.author}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="bj-caption">아직 같이 좋아하는 책을 못 찾았어요</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <p className="bj-caption" style={{ marginBottom: 12 }}>내 독서유형을 알아야 궁합을 볼 수 있어요</p>
              <Link href="/test" className="bj-btn bj-btn--primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                테스트 시작하기 →
              </Link>
            </div>
          )}
        </div>

        {/* 성향 */}
        <Link href={`/result/${type.code}`} className="bj-card" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
          <div style={{ width: 64, flexShrink: 0 }}>
            <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
          </div>
          <div>
            <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{type.code}</p>
            <p className="bj-display bj-display--lg">{type.name}</p>
            <p className="bj-caption" style={{ marginTop: 4 }}>유형 자세히 보기 →</p>
          </div>
        </Link>

        {/* 좋아하는 책 스타일 */}
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>좋아하는 책 스타일</span>
            <span className="bj-section-label__line" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {person.favoriteTags.map((tag) => (
              <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
            ))}
          </div>
        </div>

        {/* 배지 */}
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>보유 배지</span>
            <span className="bj-section-label__line" />
            <span className="bj-caption">{badges.length}/{BADGE_LIST.length}</span>
          </div>

          {badges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {badges.map((badge) => (
                <span key={badge.key} className="bj-badge bj-badge--rare" style={{ justifyContent: 'center', padding: '8px 10px' }}>
                  {badge.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="bj-caption" style={{ textAlign: 'center' }}>아직 획득한 배지가 없어요</p>
          )}
        </div>
      </div>
    </main>
  )
}
