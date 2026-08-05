'use client'

import Sheet from './Sheet'

interface ConfirmSheetProps {
  open: boolean
  message: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmSheet({
  open,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Sheet open={open} onClose={onCancel}>
      <p className="bj-h2 bj-mb-16">{message}</p>
      <div className="bj-col-8">
        <button type="button" onClick={onConfirm} className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall">
          {confirmLabel}
        </button>
        <button type="button" onClick={onCancel} className="bj-btn bj-btn--block bj-btn--tall">
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  )
}
