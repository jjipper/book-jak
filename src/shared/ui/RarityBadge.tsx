/* 04. RARITY BADGE — 희소도 뱃지 (Wildgak 허용 대상)
   흔함=원, 희귀/최희귀=폭발형(starburst). 색은 components.css가 fill/stroke로 입힌다. */

export type RarityVariant = 'common' | 'rare' | 'legendary'

interface RarityBadgeProps {
  variant: RarityVariant
  /** 흔함 / 희귀 / 최희귀 */
  label: string
  /** 상위 50% 등 보조 텍스트 */
  sub?: string
  /** sm: 결과 카드 스티커 / xs: 레일 카드 코너(라벨만 표시) */
  size?: 'md' | 'sm' | 'xs'
}

/* 16꼭지 별 (outer r=49, inner r=40, viewBox 100) */
const STARBURST_POINTS =
  '50.0,1.0 57.8,10.8 68.8,4.7 72.2,16.7 84.6,15.4 83.3,27.8 95.3,31.2 89.2,42.2 ' +
  '99.0,50.0 89.2,57.8 95.3,68.8 83.3,72.2 84.6,84.6 72.2,83.3 68.8,95.3 57.8,89.2 ' +
  '50.0,99.0 42.2,89.2 31.2,95.3 27.8,83.3 15.4,84.6 16.7,72.2 4.7,68.8 10.8,57.8 ' +
  '1.0,50.0 10.8,42.2 4.7,31.2 16.7,27.8 15.4,15.4 27.8,16.7 31.2,4.7 42.2,10.8'

export default function RarityBadge({ variant, label, sub, size = 'md' }: RarityBadgeProps) {
  return (
    <span className={`bj-rarity bj-rarity--${variant}${size !== 'md' ? ` bj-rarity--${size}` : ''}`}>
      <svg className="bj-rarity__shape" viewBox="0 0 100 100" aria-hidden="true">
        {variant === 'common' ? (
          <circle cx="50" cy="50" r="48" vectorEffect="non-scaling-stroke" />
        ) : (
          <polygon points={STARBURST_POINTS} vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      <span className="bj-rarity__label">{label}</span>
      {sub && <span className="bj-rarity__sub">{sub}</span>}
    </span>
  )
}
