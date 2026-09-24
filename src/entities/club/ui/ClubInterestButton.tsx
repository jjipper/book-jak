'use client'

// 관심 모임 토글 — 목록 카드(Link 안)와 상세에서 같이 쓴다. 로그인 게이트를 자기 안에 들고 있다.

import { toggleInterest } from '@/entities/club/model/clubActions'
import { toast } from '@/shared/lib/toast'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

interface Props {
  clubId: string
  /** 관심 여부와 그 갱신은 목록을 들고 있는 호출부가 소유한다 */
  interested: boolean
  onChange: (next: boolean) => void
}

export default function ClubInterestButton({ clubId, interested, onChange }: Props) {
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleClick(e: React.MouseEvent) {
    // 카드 전체가 Link인 자리에서도 쓰이므로 이동을 막는다
    e.preventDefault()
    e.stopPropagation()
    void requireAuth(() => {
      const next = !interested
      onChange(next) // 낙관적 — 실패하면 되돌린다
      toggleInterest(clubId, next).catch((err: Error) => {
        onChange(!next)
        toast.error(err.message)
      })
    })
  }

  return (
    <>
      <button
        type="button"
        aria-pressed={interested}
        onClick={handleClick}
        className={`bj-chip bj-club-interest${interested ? ' bj-chip--active' : ''}`}
      >
        {interested ? '관심 ♥' : '관심 ♡'}
      </button>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/clubs/${clubId}`} />
    </>
  )
}
