import type { InputHTMLAttributes, ReactNode } from 'react'

/* 10. INPUT FIELD — 검색/텍스트 입력 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode
}

export default function Input({ icon, className, ...rest }: InputProps) {
  return (
    <label className={['bj-input', className].filter(Boolean).join(' ')}>
      {icon && (
        <span className="bj-input__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <input className="bj-input__field" {...rest} />
    </label>
  )
}
