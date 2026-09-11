import type { ReactNode } from 'react'

/* SECTION LABEL — 구획 라벨 (구분선 없음) */

export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="bj-section-label">
      <span>{children}</span>
    </div>
  )
}
