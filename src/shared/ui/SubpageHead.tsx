import type { ReactNode } from 'react'
import BackLink from './BackLink'

/* 서브페이지 헤더 SubpageHead — 뒤로가기(chevron-left 24) + 간격 6 + 제목 18 ExtraBold.
   우측 보조 액션(ButtonSmall 등)은 action으로. */

interface SubpageHeadProps {
  title: string
  backHref: string
  action?: ReactNode
}

export default function SubpageHead({ title, backHref, action }: SubpageHeadProps) {
  return (
    <header className="bj-subpage-head">
      <BackLink href={backHref} />
      <h1 className="bj-subpage-head__title bj-flex-1">{title}</h1>
      {action}
    </header>
  )
}
