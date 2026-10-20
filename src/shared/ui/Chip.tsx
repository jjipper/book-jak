import type { ButtonHTMLAttributes, ReactNode } from 'react'
import Icon from './Icon'

/* 08. CHIP / TAG — 알약형: [아이콘] 라벨 [X(선택 시)]
   X는 시각 표시이며 클릭 처리는 칩 전체(onClick)가 담당한다.
   면은 담긴 면과 한 단 다르게(--color-control-surface) · 활성(주황)·잉크 변형은 바탕과 무관.
   size="sm" = 카드 종류 라벨(RecCard·ClubCard·BlindCard 상단) 26px 칩. */

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  /** 잉크900 채움 / 화이트 */
  ink?: boolean
  size?: 'md' | 'sm'
  icon?: ReactNode
}

export default function Chip({
  active = false,
  ink = false,
  size = 'md',
  icon,
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  const classes = [
    'bj-chip',
    active && 'bj-chip--active',
    ink && 'bj-chip--ink',
    size === 'sm' && 'bj-chip--sm',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} aria-pressed={active} {...rest}>
      {icon && (
        <span className="bj-chip__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span>{children}</span>
      {active && (
        <span className="bj-chip__remove" aria-hidden="true">
          <Icon name="x" size={14} />
        </span>
      )}
    </button>
  )
}
