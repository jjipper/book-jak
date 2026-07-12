import { RARITY_BADGE_LABELS, rarityBadgeVariant, type RarityLevel } from '@/data/readingTypes'
import { RarityTag } from '@/components/atoms'

/* 레거시 호환 래퍼 — v2 RarityTag(인라인 pill)로 위임.
   화면 이관 완료 후 RarityTag 직접 사용으로 대체 예정. */

interface RarityBadgeProps {
  level: RarityLevel
  pct: number
}

export default function RarityBadge({ level, pct }: RarityBadgeProps) {
  const variant = rarityBadgeVariant(level)
  return (
    <RarityTag variant={variant === 'epic' ? 'legendary' : variant}>
      {RARITY_BADGE_LABELS[variant]} {pct}%
    </RarityTag>
  )
}
