'use client'

/* 확인 모달 — Figma 02 Components > 확인 모달 Modal
   화이트 · 라운드 20 · 폭 295 · 제목 18 ExtraBold 중앙 + 설명 14 · 버튼 2단(프라이머리/텍스트) 세로.
   이름은 호출부 호환을 위해 ConfirmSheet 그대로 둔다. */

interface ConfirmSheetProps {
  open: boolean
  message: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmSheet({
  open,
  message,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  if (!open) return null
  return (
    <div className="bj-modal__overlay" role="presentation" onClick={onCancel}>
      <div
        className="bj-modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={message}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="bj-modal__title">{message}</p>
        {description && <p className="bj-modal__desc">{description}</p>}
        <div className="bj-modal__actions">
          <button type="button" onClick={onConfirm} className="bj-btn bj-btn--primary bj-btn--block">
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="bj-btn bj-btn--text bj-btn--block">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
