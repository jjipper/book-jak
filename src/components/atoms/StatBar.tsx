import type { ReactNode } from 'react'

/* 05. STAT BAR — 능력치 (몰입력 92 등) */

interface StatBarProps {
  /** 능력치 이름 (몰입력 등) */
  name: string
  /** 0 ~ max */
  value: number
  max?: number
  icon?: ReactNode
}

export default function StatBar({ name, value, max = 100, icon }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className="bj-stat">
      {icon && (
        <span className="bj-stat__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="bj-stat__name">{name}</span>
      <div
        className="bj-stat__track"
        role="meter"
        aria-label={name}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
      >
        <div className="bj-stat__fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="bj-stat__value">{value}</span>
    </div>
  )
}
