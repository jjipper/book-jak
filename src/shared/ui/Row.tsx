import type { HTMLAttributes } from 'react'

/* ROW — 리스트 행 (칭호, 배지, 궁합 등) */

export default function Row({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={['bj-row', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  )
}
