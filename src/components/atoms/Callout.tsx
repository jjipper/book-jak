import type { HTMLAttributes } from 'react'

/* CALLOUT — 인용구 / 처방 / 안내 박스 */

interface CalloutProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean
}

export default function Callout({ muted = false, className, children, ...rest }: CalloutProps) {
  const classes = ['bj-callout', muted && 'bj-callout--muted', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
