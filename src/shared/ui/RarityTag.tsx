import type { ReactNode } from 'react'
import type { RarityVariant } from './RarityBadge'

/* 04b. RARITY TAG — 인라인 희소도 pill (목록/프로필용 소형, Wildgak 허용 대상) */

interface RarityTagProps {
  variant: RarityVariant
  /** "희귀 4.1%" 등 */
  children: ReactNode
}

export default function RarityTag({ variant, children }: RarityTagProps) {
  return <span className={`bj-rarity-tag bj-rarity-tag--${variant}`}>{children}</span>
}
