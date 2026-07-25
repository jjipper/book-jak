'use client'

import Link from 'next/link'
import type { BookClub } from '@/entities/club/model/clubs'
import { displayMemberCount } from '@/entities/club/model/clubActions'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import SectionHead from './SectionHead'
import { PeopleIcon } from './icons'

/* 책 모임 — 원형 썸네일 + 본문 가로 카드(시안). 썸네일은 /assets/illust/club-{id}.png 빈 슬롯. */

interface ClubRailProps {
  clubs: BookClub[]
}

export default function ClubRail({ clubs }: ClubRailProps) {
  return (
    <section className="bj-section">
      <SectionHead
        title="책 모임"
        icon={<PeopleIcon />}
        cap="함께 읽고, 더 깊이 이야기해요"
        moreHref="/social/clubs"
      />
      <div className="bj-rail bj-rail--lg-grid-2">
        {clubs.map((club) => (
          <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-club-card">
            <div className="bj-club-card__thumb">
              <IllustPlaceholder code={`club-${club.id}`} alt={club.name} aspectRatio="1 / 1" fallback="slot" />
            </div>
            <div className="bj-club-card__body">
              <p className="bj-club-card__name" style={{ margin: 0 }}>{club.name}</p>
              <div className="bj-club-card__chips">
                <span className="bj-club-card__chip bj-club-card__chip--format">{club.format}</span>
                <span className="bj-club-card__chip">
                  정원 {displayMemberCount(club)}/{club.capacity}
                </span>
                {club.region && <span className="bj-club-card__chip">{club.region}</span>}
              </div>
              <p className="bj-club-card__desc bj-clamp-1" style={{ margin: 0 }}>{club.description}</p>
              <p className="bj-club-card__tags" style={{ margin: 0 }}>
                {club.tags.map((t) => `#${t}`).join('  ')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
