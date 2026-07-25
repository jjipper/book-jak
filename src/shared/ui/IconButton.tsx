import type { ButtonHTMLAttributes, ReactNode } from 'react'

/* 01b. ICON BUTTON — 하트/댓글/공유/더보기 등 */

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  /** 접근성 라벨 (필수) */
  label: string
  active?: boolean
  children: ReactNode
}

export default function IconButton({
  label,
  active = false,
  type = 'button',
  className,
  children,
  ...rest
}: IconButtonProps) {
  const classes = ['bj-icon-btn', active && 'bj-icon-btn--active', className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} aria-label={label} className={classes} {...rest}>
      {children}
    </button>
  )
}
