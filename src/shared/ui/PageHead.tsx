import type { ReactNode } from 'react'

/* 페이지 헤드 PageHead — 탭 루트 화면 상단.
   제목행 32 (Wildgak 24 + 우측 아이콘 24, 마이=settings) · 간격 6 · 캡션 12 (없으면 숨김). */

interface PageHeadProps {
  title: string
  caption?: string
  /** 우측 아이콘 버튼 등 */
  action?: ReactNode
}

export default function PageHead({ title, caption, action }: PageHeadProps) {
  return (
    <header className="bj-page-head">
      <div className="bj-page-head__row">
        <h1 className="bj-page-head__title">{title}</h1>
        {action}
      </div>
      {caption && <p className="bj-page-head__caption">{caption}</p>}
    </header>
  )
}
