import type { ButtonHTMLAttributes } from 'react'

/* 01. BUTTONS — primary(주요 액션) / secondary(보조 액션) / text(텍스트 버튼)
   높이 48 · 라운드 12 · 라벨 14. size="sm" = 작은 버튼 ButtonSmall(32 · 13 Medium · 폭 hug) —
   헤더·카드 안 보조 액션(다시하기·수정)은 variant="text" + size="sm". */

type ButtonVariant = 'primary' | 'secondary' | 'text'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: 'md' | 'sm'
  block?: boolean
}

export default function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  type = 'button',
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'bj-btn',
    `bj-btn--${variant}`,
    size === 'sm' && 'bj-btn--sm',
    block && 'bj-btn--block',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
