import Link from 'next/link'

/* 섹션 공통 헤더 — 제목 + 보조 캡션 + 더보기 링크 */

interface SectionHeadProps {
  title: string
  cap?: string
  moreHref?: string
}

export default function SectionHead({ title, cap, moreHref }: SectionHeadProps) {
  return (
    <div className="bj-section__head">
      <h2 className="bj-section__title" style={{ margin: 0 }}>
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
