import Icon from './Icon'

/* 09. CHECK — 체크박스 20×20 라운드 8 · 미체크 눌림 / 체크됨 주황500 + 화이트 체크 */

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
      {checked && <Icon name="check" size={14} />}
    </button>
  )
}
