import type { ReactNode } from 'react'

/* SECTION LABEL — 대문자 구획 라벨 + 구분선 */

export default function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div className="bj-section-label">
      <span>{children}</span>
      <span className="bj-section-label__line" aria-hidden="true" />
    </div>
  )
}
