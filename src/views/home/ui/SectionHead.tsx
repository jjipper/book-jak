import Link from 'next/link'
import type { ReactNode } from 'react'

/* 섹션 공통 헤더 — 아이콘 + 제목 + 보조 캡션 + 더보기 링크 */

interface SectionHeadProps {
  title: string
  icon?: ReactNode
  cap?: string
  moreHref?: string
}

export default function SectionHead({ title, icon, cap, moreHref }: SectionHeadProps) {
  return (
    <div className="bj-section__head">
      <h2 className="bj-section__title" style={{ margin: 0 }}>
        {icon && <span className="bj-section__icon">{icon}</span>}
        {title}
        {cap && <span className="bj-section__cap">{cap}</span>}
      </h2>
      {moreHref && (
        <Link href={moreHref} className="bj-more">
          더보기 ›
        </Link>
      )}
    </div>
  )
}
