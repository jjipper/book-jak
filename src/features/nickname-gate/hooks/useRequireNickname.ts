'use client'

import { useCallback, useState } from 'react'
import { getNickname, setNickname as saveNickname } from '@/entities/user/model/profile'
import { upsertProfile } from '@/entities/user/api/profileRemote'

export function useRequireNickname() {
  const [pendingAction, setPendingAction] = useState<((nickname: string) => void) | null>(null)

  const requireNickname = useCallback((action: (nickname: string) => void) => {
    const existing = getNickname()
    if (existing) {
      action(existing)
    } else {
      setPendingAction(() => action)
    }
  }, [])

  async function handleNicknameSubmit(name: string): Promise<void> {
    await upsertProfile(name)  // 비로그인이면 no-op, 실패 시 throw → NicknameSheet가 에러 표시
    saveNickname(name)
    const action = pendingAction
    setPendingAction(null)
    action?.(name)
  }

  return {
    showNicknameSheet: pendingAction !== null,
    requireNickname,
    handleNicknameSubmit,
    closeNicknameSheet: () => setPendingAction(null),
  }
}
