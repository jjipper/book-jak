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
      <span className="bj-option__text">{children}</span>
    </button>
  )
}
