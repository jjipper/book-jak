/* 02b. PROGRESS — 진행 바 (2/12) */

interface ProgressProps {
  value: number
  max: number
  /** "2 / 12" 라벨 표시 여부 */
  showLabel?: boolean
}

export default function Progress({ value, max, showLabel = true }: ProgressProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      className="bj-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
    >
      <div className="bj-progress__track">
        <div className="bj-progress__fill" style={{ width: `${pct}%` }} />
      </div>
      {showLabel && (
        <span className="bj-progress__label">
          {value} / {max}
        </span>
      )}
    </div>
  )
}
