'use client'

import Link from 'next/link'
import type { BookClub } from '@/data/clubs'
import { displayMemberCount } from '@/lib/clubs'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import SectionHead from './SectionHead'

/* 책 모임 — 가로 레일. 커버는 /assets/illust/club-{id}.png 빈 슬롯(폴백 자동). */

interface ClubRailProps {
  clubs: BookClub[]
}

export default function ClubRail({ clubs }: ClubRailProps) {
  return (
    <section className="bj-section">
      <SectionHead title="책 모임" cap="함께 읽고 이야기해요" moreHref="/social/clubs" />
      <div className="bj-rail">
        {clubs.map((club) => (
          <Link key={club.id} href={`/social/clubs/${club.id}`} className="bj-club-card">
            <IllustPlaceholder code={`club-${club.id}`} alt={club.name} aspectRatio="5 / 2" />
            <div className="bj-club-card__body">
              <p className="bj-club-card__name" style={{ margin: 0 }}>{club.name}</p>
              <div className="bj-club-card__chips">
                <span className="bj-club-card__chip">{club.format}</span>
                <span className="bj-club-card__chip">
                  정원 {displayMemberCount(club)}/{club.capacity}
                </span>
                {club.region && <span className="bj-club-card__chip">{club.region}</span>}
              </div>
              <p className="bj-club-card__desc bj-clamp-2" style={{ margin: 0 }}>
                {club.description} {club.tags.map((t) => `#${t}`).join(' ')}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
