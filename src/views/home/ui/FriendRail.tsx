'use client'

import Link from 'next/link'
import type { MatchedPerson } from '@/features/people-match/model/peopleMatch'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import SectionHead from './SectionHead'
import { PeopleIcon } from './icons'

/* 소셜 둘러보기 — 취향 매칭 상대. 테스트 결과가 있는 유저에게만 노출(부모에서 분기) */

interface FriendRailProps {
  matches: MatchedPerson[]
}

export default function FriendRail({ matches }: FriendRailProps) {
  return (
    <section className="bj-section">
      <SectionHead
        title="소셜 둘러보기"
        icon={<PeopleIcon />}
        cap="나와 취향이 비슷한 사람들을 만나보세요"
        moreHref="/social/people"
      />
      <div className="bj-rail bj-rail--lg-wrap">
        {matches.map(({ person, affinity }) => (
          <Link key={person.id} href={`/people/${person.id}`} className="bj-friend-card">
            <div className="bj-friend-card__face">
              <IllustPlaceholder code={person.typeCode} alt={person.nickname} aspectRatio="1 / 1" fallback="slot" />
            </div>
            <p className="bj-friend-card__name" style={{ margin: 0 }}>{person.nickname}</p>
            <p className="bj-friend-card__match" style={{ margin: 0 }}>궁합 {affinity}%</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
