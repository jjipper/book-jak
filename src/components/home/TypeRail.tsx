import { TYPE_CODES, READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS } from '@/data/readingTypes'
import { RarityTag } from '@/components/atoms'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import SectionHead from './SectionHead'

/* 16가지 유형 — 정사각 일러스트 슬롯 + 희소도 뱃지(와일드각 허용 대상) */

export default function TypeRail() {
  return (
    <section className="bj-section">
      <SectionHead title="16가지 유형" cap="당신은 어떤 독서가?" />
      <div className="bj-rail">
        {TYPE_CODES.map((code) => {
          const t = READING_TYPES[code]
          const badge = rarityBadgeVariant(t.rarityLevel)
          const variant = badge === 'epic' ? 'legendary' : badge
          return (
            <article key={code} className="bj-type-card">
              <div className="bj-type-card__illust">
                <IllustPlaceholder code={t.code} alt={t.name} aspectRatio="1 / 1" />
                <span className="bj-type-card__rarity">
                  <RarityTag variant={variant}>{RARITY_BADGE_LABELS[badge]}</RarityTag>
                </span>
              </div>
              <p className="bj-type-card__name" style={{ margin: 0 }}>{t.name}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
