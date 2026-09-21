'use client'

import { useEffect, useState } from 'react'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { fetchProfile, upsertProfile, saveTypeCode } from '@/entities/user/api/profileRemote'
import { setNickname, setAvatar, setMyId } from '@/entities/user/model/profile'
import { loadResult, restoreResult } from '@/entities/reading-type/model/scoring'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

// 서버 우선 — 계정에 유형이 있으면 그걸로 맞추고, 없을 때만 로컬 결과를 올린다(비로그인 테스트 후 첫 로그인).
// 로컬 우선으로 하면 공용 기기에서 앞사람 결과가 다음 사람 계정을 덮는다.
// ponytail: 서버에 시각이 없어 비로그인 상태에서 다시 한 테스트는 로그인하면 계정 값에 밀린다. 로그인 상태 재응시는 완료 시 바로 서버에 저장되므로 문제없다.
function syncTypeCode(serverCode: string | null) {
  const local = loadResult()?.typeCode
  if (serverCode) {
    if (local !== serverCode) restoreResult(serverCode)
  } else if (local) {
    saveTypeCode(local).catch(() => {})
  }
}

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
        syncTypeCode(profile.type_code)
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
            syncTypeCode(null)
            setNeedsNickname(false)
          }}
        />
      )}
    </>
  )
}
