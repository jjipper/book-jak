'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadPerson } from '@/entities/person/api/personRemote'
import type { Person } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { affinityLabel } from '@/entities/reading-type/model/affinity'
import { getPersonInsight, type PersonInsight } from '@/features/people-match/model/peopleMatch'
import { getFollowingIds, toggleFollow } from '@/features/follow/model/follows'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'
import TypeBadge from '@/shared/ui/TypeBadge'

export default function PersonDetailView() {
  const params = useParams<{ id: string }>()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [insight, setInsight] = useState<PersonInsight | null>(null)
  const [following, setFollowing] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    async function load() {
      const [p, following] = await Promise.all([loadPerson(params.id), getFollowingIds()])
      setPerson(p)
      setInsight(p ? getPersonInsight(p) : null)
      setFollowing(following.includes(params.id))
      setLoading(false)
    }
    void load()
  }, [params.id])

  function handleToggleFollow() {
    requireAuth(() => {
      void toggleFollow(params.id).then(setFollowing)
    })
  }

  if (loading || !person) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-pad-v-lg">
            <BackLink href="/social/people" />
            <p className="bj-body bj-mt-20">{loading ? '불러오는 중…' : '사람을 찾을 수 없어요'}</p>
          </div>
        </div>
      </main>
    )
  }

  const type = person.typeCode ? READING_TYPES[person.typeCode] : null

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/social/people" />
        <span className="bj-h2 bj-truncate">{person.nickname}</span>
      </header>

      <div className="bj-content--lg">

        {/* 프로필 */}
        <div className="bj-person-profile">
          <div className="bj-person-thumb">
            {type && <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />}
          </div>
          <div className="bj-flex-1">
            <p className="bj-h2 bj-truncate">{person.nickname}</p>
            <p className="bj-caption bj-truncate">{person.bio}</p>
            <div className="bj-person-stats">
              <span className="bj-person-stat">
                <span className="bj-stat-num">{person.followingCount}</span>
                <span className="bj-caption">팔로잉</span>
              </span>
              <span className="bj-person-stat">
                <span className="bj-stat-num">{person.followerCount}</span>
                <span className="bj-caption">팔로워</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleFollow}
          className={`bj-btn bj-btn--block ${following ? 'bj-btn--secondary' : 'bj-btn--primary'}`}
        >
          {following ? '팔로잉' : '팔로우'}
        </button>

        {/* 나와의 궁합 */}
        <div className="bj-card">
          <div className="bj-card-section-head">
            <span className="bj-section-tag">나와의 궁합</span>
          </div>

          {insight && insight.affinity !== null ? (
            <>
              <div className="bj-affinity-center">
                <p className="bj-display bj-display--xl bj-affinity-pct--xl">{insight.affinity}%</p>
                <p className="bj-body bj-affinity-label">{affinityLabel(insight.affinity)}</p>
              </div>

              <div>
                <p className="bj-caption bj-bold bj-mb-6">겹치는 취향</p>
                {insight.sharedTags.length > 0 ? (
                  <div className="bj-tag-group">
                    {insight.sharedTags.map((tag) => (
                      <span key={tag} className="bj-chip">#{tag}</span>
                    ))}
                  </div>
                ) : (
                  <p className="bj-caption">아직 겹치는 취향을 못 찾았어요</p>
                )}
              </div>
            </>
          ) : (
            <div className="bj-text-center bj-pad-v-sm">
              <p className="bj-caption bj-caption--mb12">
                {person.typeCode
                  ? '내 독서유형을 알아야 궁합을 볼 수 있어요'
                  : '이 사람이 아직 독서유형 테스트를 하지 않았어요'}
              </p>
              {!person.typeCode ? null : (
                <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta-sm">
                  테스트 시작하기 →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 성향 */}
        {type && (
          <Link href={`/result/${type.code}`} className="bj-card bj-person-type-link">
            <div className="bj-person-thumb">
              <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
            </div>
            <div>
              <div className="bj-mb-8"><TypeBadge code={type.code} /></div>
              <p className="bj-display bj-display--lg">{type.name}</p>
              <p className="bj-caption bj-mt-4">유형 자세히 보기 →</p>
            </div>
          </Link>
        )}

        {/* 좋아하는 책 스타일 */}
        {person.favoriteTags.length > 0 && (
          <div className="bj-card">
            <div className="bj-card-section-head">
              <span className="bj-section-tag">좋아하는 책 스타일</span>
            </div>
            <div className="bj-tag-group">
              {person.favoriteTags.map((tag) => (
                <span key={tag} className="bj-chip">#{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/people/${params.id}`} />
      </div>
    </main>
  )
}
