'use client'

import { useCallback, useState } from 'react'
import { getNickname, setNickname as saveNickname } from '@/entities/user/model/profile'

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

  function handleNicknameSubmit(name: string) {
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
