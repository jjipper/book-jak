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
import { useAuthGate } from '@/shared/lib/useAuthGate'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

// TODO: 실 사용자 프로필 Supabase 연동
//   - MOCK_PEOPLE.find → sb.from('profiles').select().eq('id', id).single()
//   - 팔로우 액션도 서버 반영 필요 (현재 localStorage만)
export default function PersonDetailView() {
  const params = useParams<{ id: string }>()
  const person = MOCK_PEOPLE.find((p) => p.id === params.id) ?? null

  const [following, setFollowing] = useState(false)
  const [insight, setInsight] = useState<PersonInsight | null>(null)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    if (!person) return
    setFollowing(isFollowing(person.id))
    setInsight(getPersonInsight(person))
  }, [person])

  if (!person) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-pad-v-lg">
            <Link href="/social/people" className="bj-icon-btn">←</Link>
            <p className="bj-body bj-mt-20">사람을 찾을 수 없어요</p>
          </div>
        </div>
      </main>
    )
  }

  const type = READING_TYPES[person.typeCode]
  const badges = BADGE_LIST.filter((b) => person.badgeKeys.includes(b.key))

  function handleToggleFollow() {
    requireAuth(() => setFollowing(toggleFollow(person!.id)))
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social/people" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">{person.nickname}</span>
      </header>

      <div className="bj-content--lg">

        {/* 프로필 */}
        <div className="bj-person-profile">
          <div className="bj-person-thumb">
            <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
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
          <button
            type="button"
            onClick={handleToggleFollow}
            className={`bj-chip${following ? ' bj-chip--active bj-follow-chip--active' : ' bj-follow-chip'}`}
          >
            {following ? '팔로잉' : '팔로우'}
          </button>
        </div>

        {/* 나와의 궁합 */}
        <div className="bj-card">
          <div className="bj-card-section-head">
            <span className="bj-section-tag">나와의 궁합</span>
            <span className="bj-section-label__line" />
          </div>

          {insight?.affinity !== null && insight?.affinity !== undefined ? (
            <>
              <div className="bj-affinity-center">
                <p className="bj-display bj-display--xl bj-affinity-pct--xl">{insight.affinity}%</p>
                <p className="bj-body bj-affinity-label">{affinityLabel(insight.affinity)}</p>
              </div>

              <div className="bj-col-10">
                <div>
                  <p className="bj-caption bj-bold bj-mb-6">겹치는 취향</p>
                  {insight.sharedTags.length > 0 ? (
                    <div className="bj-tag-group">
                      {insight.sharedTags.map((tag) => (
                        <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="bj-caption">아직 겹치는 취향을 못 찾았어요</p>
                  )}
                </div>
                <div>
                  <p className="bj-caption bj-bold bj-mb-6">동시에 좋아하는 책</p>
                  {insight.sharedBooks.length > 0 ? (
                    <div className="bj-col-6">
                      {insight.sharedBooks.map((book) => (
                        <div key={book.id} className="bj-row bj-row--compact">
                          <p className="bj-activity-label bj-activity-label--sm">{book.title}</p>
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
            <div className="bj-text-center bj-pad-v-sm">
              <p className="bj-caption bj-caption--mb12">내 독서유형을 알아야 궁합을 볼 수 있어요</p>
              <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta-sm">
                테스트 시작하기 →
              </Link>
            </div>
          )}
        </div>

        {/* 성향 */}
        <Link href={`/result/${type.code}`} className="bj-card bj-person-type-link">
          <div className="bj-person-thumb">
            <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
          </div>
          <div>
            <p className="bj-caption bj-bold bj-mb-4">{type.code}</p>
            <p className="bj-display bj-display--lg">{type.name}</p>
            <p className="bj-caption bj-mt-4">유형 자세히 보기 →</p>
          </div>
        </Link>

        {/* 좋아하는 책 스타일 */}
        <div className="bj-card">
          <div className="bj-card-section-head">
            <span className="bj-section-tag">좋아하는 책 스타일</span>
            <span className="bj-section-label__line" />
          </div>
          <div className="bj-tag-group">
            {person.favoriteTags.map((tag) => (
              <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
            ))}
          </div>
        </div>

        {/* 배지 */}
        <div className="bj-card">
          <div className="bj-card-section-head--mb16">
            <span className="bj-section-tag">보유 배지</span>
            <span className="bj-section-label__line" />
            <span className="bj-caption">{badges.length}/{BADGE_LIST.length}</span>
          </div>

          {badges.length > 0 ? (
            <div className="bj-badge-grid">
              {badges.map((badge) => (
                <span key={badge.key} className="bj-badge bj-badge--rare bj-badge--centered">
                  {badge.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="bj-caption bj-text-center">아직 획득한 배지가 없어요</p>
          )}
        </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/people/${params.id}`} />
      </div>
    </main>
  )
}
