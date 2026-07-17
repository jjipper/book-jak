import Link from 'next/link'
import { TYPE_CODES, READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS } from '@/data/readingTypes'
import { RarityBadge } from '@/components/atoms'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import SectionHead from './SectionHead'
import { StarIcon } from './icons'

/* 16가지 유형 미리보기 — 유형명 위 + 정사각 일러스트 + 코너 희소도 뱃지(와일드각 허용 대상)
   카드 클릭 시 해당 유형 결과 페이지로 이동 */

export default function TypeRail() {
  return (
    <section className="bj-section">
      <SectionHead title="16가지 유형 미리보기" icon={<StarIcon />} cap="당신은 어떤 독서가일까요?" />
      <div className="bj-rail">
        {TYPE_CODES.map((code) => {
          const t = READING_TYPES[code]
          const badge = rarityBadgeVariant(t.rarityLevel)
          const variant = badge === 'epic' ? 'legendary' : badge
          return (
            <Link
              key={code}
              href={`/result/${code}`}
              className="bj-type-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="bj-type-card__illust">
                <IllustPlaceholder
                  code={t.code}
                  alt={t.name}
                  aspectRatio="1 / 1"
                  fallback="slot"
                  background="var(--color-surface-spotlight)"
                />
                <span className="bj-type-card__rarity">
                  <RarityBadge variant={variant} label={RARITY_BADGE_LABELS[badge]} size="xs" />
                </span>
              </div>
              <p className="bj-type-card__name" style={{ margin: 0 }}>{t.name}</p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
