'use client'

import type { ReactNode } from 'react'

/* SHEET — 바텀시트 모달 (유형 선택 등). 오버레이 클릭 시 닫힘. */

interface SheetProps {
  open: boolean
  onClose?: () => void
  children: ReactNode
}

export default function Sheet({ open, onClose, children }: SheetProps) {
  if (!open) return null
  return (
    <div className="bj-sheet__overlay" role="presentation" onClick={onClose}>
      <div
        className="bj-sheet"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}
