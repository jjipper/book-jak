'use client'

import { useState } from 'react'
import Sheet from '@/shared/ui/Sheet'
import { toast } from '@/shared/lib/toast'
import {
  REPORT_REASONS,
  blockUser,
  reportContent,
  type ReportTargetType,
} from '@/entities/report/api/moderationRemote'

interface ModerationSheetProps {
  open: boolean
  onClose: () => void
  targetType: ReportTargetType
  targetId: string
  authorId: string
  /** 내 글·댓글이면 삭제만 노출 */
  isMine?: boolean
  onDelete?: () => void | Promise<void>
  onBlocked?: (userId: string) => void
}

export default function ModerationSheet({
  open, onClose, targetType, targetId, authorId, isMine, onDelete, onBlocked,
}: ModerationSheetProps) {
  const [reporting, setReporting] = useState(false)

  function close() {
    setReporting(false)
    onClose()
  }

  if (isMine) {
    return (
      <Sheet open={open} onClose={close}>
        <p className="bj-h2 bj-mb-16">이 {targetType === 'comment' ? '댓글' : '글'}을 삭제할까요?</p>
        <div className="bj-col-8">
          <button
            type="button"
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
            onClick={async () => { await onDelete?.(); close() }}
          >
            삭제하기
          </button>
          <button type="button" className="bj-btn bj-btn--block bj-btn--tall" onClick={close}>취소</button>
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet open={open} onClose={close}>
      {reporting ? (
        <>
          <p className="bj-h2 bj-mb-16">신고 사유를 골라주세요</p>
          <div className="bj-col-8">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                className="bj-btn bj-btn--block bj-btn--tall"
                onClick={async () => {
                  await reportContent(targetType, targetId, reason)
                  toast.show('신고가 접수됐어요')
                  close()
                }}
              >
                {reason}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="bj-h2 bj-mb-16">이 {targetType === 'comment' ? '댓글' : '글'}을 어떻게 할까요?</p>
          <div className="bj-col-8">
            <button type="button" className="bj-btn bj-btn--block bj-btn--tall" onClick={() => setReporting(true)}>
              신고하기
            </button>
            <button
              type="button"
              className="bj-btn bj-btn--block bj-btn--tall"
              onClick={async () => {
                await blockUser(authorId)
                onBlocked?.(authorId)
                toast.show('차단했어요. 이 사용자의 글이 보이지 않아요')
                close()
              }}
            >
              이 사용자 차단
            </button>
            <button type="button" className="bj-btn bj-btn--block bj-btn--tall" onClick={close}>취소</button>
          </div>
        </>
      )}
    </Sheet>
  )
}
