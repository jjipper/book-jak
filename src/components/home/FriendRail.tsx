'use client'

import Link from 'next/link'
import type { MatchedPerson } from '@/lib/peopleMatch'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import SectionHead from './SectionHead'

/* 취향이 비슷한 친구 — 테스트 결과가 있는 유저에게만 노출(부모에서 분기) */

interface FriendRailProps {
  matches: MatchedPerson[]
}

export default function FriendRail({ matches }: FriendRailProps) {
  return (
    <section className="bj-section">
      <SectionHead title="취향이 비슷한 친구" cap="궁합 순" moreHref="/social/people" />
      <div className="bj-rail">
        {matches.map(({ person, affinity }) => (
          <Link key={person.id} href={`/people/${person.id}`} className="bj-friend-card">
            <div className="bj-friend-card__face">
              <IllustPlaceholder code={person.typeCode} alt={person.nickname} aspectRatio="1 / 1" />
            </div>
            <p className="bj-friend-card__name" style={{ margin: 0 }}>{person.nickname}</p>
            <p className="bj-friend-card__match" style={{ margin: 0 }}>궁합 {affinity}%</p>
            <p className="bj-friend-card__hint" style={{ margin: 0 }}>프로필 보기 ›</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
