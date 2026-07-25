import type { HTMLAttributes } from 'react'

/* CARD — 06. PROFILE / 07. RECOMMENDATION 등이 공유하는 공통 컨테이너
   기본: 보더 없음 + 연한 베이지 / spotlight: 흰 배경 + 연한 그레이 보더 */

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  spotlight?: boolean
}

export default function Card({ spotlight = false, className, children, ...rest }: CardProps) {
  const classes = ['bj-card', spotlight && 'bj-card--spotlight', className]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
