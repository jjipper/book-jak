'use client'

import { useState, useCallback } from 'react'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export function useAuthGate() {
  const [showGate, setShowGate] = useState(false)

  const requireAuth = useCallback(async (action: () => void) => {
    const sb = createSupabaseBrowser()
    const { data: { session } } = await sb.auth.getSession()
    if (!session) {
      setShowGate(true)
      return
    }
    action()
  }, [])

  return {
    showGate,
    closeGate: () => setShowGate(false),
    requireAuth,
  }
}
