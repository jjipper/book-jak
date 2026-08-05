'use client'

import { useEffect, useState } from 'react'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { fetchProfile, upsertProfile } from '@/entities/user/api/profileRemote'
import { setNickname, setAvatar } from '@/entities/user/model/profile'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [needsNickname, setNeedsNickname] = useState(false)

  useEffect(() => {
    const sb = createSupabaseBrowser()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return  // 비로그인 방문자 — 닉네임 게이트 없음
      const profile = await fetchProfile()
      if (!profile) {
        setNeedsNickname(true)
      } else {
        setNickname(profile.nickname)
        if (profile.avatar_url) setAvatar(profile.avatar_url)
      }
    })
  }, [])

  return (
    <>
      {children}
      {needsNickname && (
        <NicknameSheet
          onClose={() => {}}
          onSubmit={async (name) => {
            await upsertProfile(name)
            setNickname(name)
            setNeedsNickname(false)
          }}
        />
      )}
    </>
  )
}
