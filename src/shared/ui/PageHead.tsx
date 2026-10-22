import type { ReactNode } from 'react'

/* 페이지 헤드 PageHead — 탭 루트 화면 상단.
   제목행 32 (Wildgak 24 + 우측 아이콘 24, 마이=settings · 그 외=PageHelp "?").
   캡션은 쓰지 않는다 — 설명이 필요하면 PageHelp 모달로 (2026-10-22). prop은 호환용으로만 남김. */

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
