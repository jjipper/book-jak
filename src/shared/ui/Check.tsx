/* 09. CHECK — 체크박스 */

interface CheckProps {
  checked: boolean
  /** 접근성 라벨 (필수) */
  label: string
  disabled?: boolean
  onToggle?: () => void
}

export default function Check({ checked, label, disabled = false, onToggle }: CheckProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`bj-check${checked ? ' bj-check--checked' : ''}`}
      onClick={onToggle}
    >
      {checked && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m5 12.5 4.5 4.5L19 7" />
        </svg>
      )}
    </button>
  )
}
