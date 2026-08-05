'use client'

import { useRouter } from 'next/navigation'
import Sheet from './Sheet'

interface LoginGateSheetProps {
  open: boolean
  onClose: () => void
  next?: string
}

export default function LoginGateSheet({ open, onClose, next = '/' }: LoginGateSheetProps) {
  const router = useRouter()
  return (
    <Sheet open={open} onClose={onClose}>
      <p className="bj-h2 bj-mb-8">로그인이 필요해요</p>
      <p className="bj-body bj-text-muted bj-mb-20">로그인하고 더 많은 기능을 써보세요</p>
      <div className="bj-col-8">
        <button
          type="button"
          onClick={() => router.push(`/login?next=${encodeURIComponent(next)}`)}
          className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
        >
          로그인하기
        </button>
        <button type="button" onClick={onClose} className="bj-btn bj-btn--block bj-btn--tall">
          나중에
        </button>
      </div>
    </Sheet>
  )
}
