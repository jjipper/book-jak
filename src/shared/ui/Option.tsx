import type { ReactNode } from 'react'

/* 02. QUESTION CARD 선택지 (A/B/C/D) — selected 상태 포함 */

interface OptionProps {
  /** A / B / C / D */
  optionKey: string
  selected?: boolean
  disabled?: boolean
  onSelect?: () => void
  children: ReactNode
}

export default function Option({
  optionKey,
  selected = false,
  disabled = false,
  onSelect,
  children,
}: OptionProps) {
  return (
    <button
      type="button"
      className={`bj-option${selected ? ' bj-option--selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
    >
      <span className="bj-option__key">{optionKey}</span>
      <span>{children}</span>
      {selected && (
        <span className="bj-option__check" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" />
            <path
              d="m8 12.5 2.8 2.8L16 9.5"
              fill="none"
              stroke="var(--color-text-on-accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
    </button>
  )
}
