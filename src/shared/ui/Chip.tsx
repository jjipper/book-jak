import type { ButtonHTMLAttributes, ReactNode } from 'react'

/* 08. CHIP / TAG — 알약형: [아이콘] 라벨 [X(선택 시)]
   X는 시각 표시이며 클릭 처리는 칩 전체(onClick)가 담당한다. */

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
  icon?: ReactNode
}

export default function Chip({
  active = false,
  icon,
  type = 'button',
  className,
  children,
  ...rest
}: ChipProps) {
  const classes = ['bj-chip', active && 'bj-chip--active', className].filter(Boolean).join(' ')
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </span>
      )}
    </button>
  )
}
