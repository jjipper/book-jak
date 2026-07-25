/* 09. TOGGLE — 스위치 */

interface ToggleProps {
  on: boolean
  /** 접근성 라벨 (필수) */
  label: string
  disabled?: boolean
  onToggle?: () => void
}

export default function Toggle({ on, label, disabled = false, onToggle }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`bj-toggle${on ? ' bj-toggle--on' : ''}`}
      onClick={onToggle}
    />
  )
}
