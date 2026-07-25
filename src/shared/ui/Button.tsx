import type { ButtonHTMLAttributes } from 'react'

/* 01. BUTTONS — primary(주요 액션) / secondary(보조 액션) / text(텍스트 버튼) */

type ButtonVariant = 'primary' | 'secondary' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  block?: boolean
}

export default function Button({
  variant = 'primary',
  block = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['bj-btn', `bj-btn--${variant}`, block && 'bj-btn--block', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
