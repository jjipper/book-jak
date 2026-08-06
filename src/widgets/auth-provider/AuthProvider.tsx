'use client'

import { useEffect, useState } from 'react'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { fetchProfile, upsertProfile } from '@/entities/user/api/profileRemote'
import { setNickname, setAvatar, setMyId } from '@/entities/user/model/profile'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [needsNickname, setNeedsNickname] = useState(false)

  useEffect(() => {
    const sb = createSupabaseBrowser()
    sb.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return  // 비로그인 방문자 — 닉네임 게이트 없음
      setMyId(user.id)
      const profile = await fetchProfile()
      if (!profile) {
        setNeedsNickname(true)
      } else {
        setNickname(profile.nickname)
        if (profile.avatar_url) setAvatar(profile.avatar_url)
      }
    }).catch(() => {
      // 네트워크 오류 등으로 인증 확인 실패 — 닉네임 게이트 미진입으로 처리
    })
  }, [])

  return (
    <>
      {children}
      {needsNickname && (
        <NicknameSheet
          onClose={() => {
            if (navigator.vibrate) navigator.vibrate(80)
          }}
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
