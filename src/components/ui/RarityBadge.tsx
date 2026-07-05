import { RARITY_BADGE_LABELS, rarityBadgeVariant, type RarityLevel } from '@/data/readingTypes'

interface RarityBadgeProps {
  level: RarityLevel
  pct: number
}

export default function RarityBadge({ level, pct }: RarityBadgeProps) {
  const variant = rarityBadgeVariant(level)
  return (
    <span className={`bj-badge bj-badge--${variant}`}>
      {RARITY_BADGE_LABELS[variant]} {pct}%
    </span>
  )
}
