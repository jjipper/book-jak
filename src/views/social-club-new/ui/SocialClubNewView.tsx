'use client'

import { useRouter } from 'next/navigation'
import { createClub, type ClubInput } from '@/entities/club/model/clubActions'
import ClubForm from '@/features/club-form/ui/ClubForm'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'
import { toast } from '@/shared/lib/toast'

export default function SocialClubNewView() {
  const router = useRouter()
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleSubmit(values: ClubInput) {
    void requireAuth(() => {
      requireNickname(async () => {
        try {
          const club = await createClub(values)
          router.push(`/social/clubs/${club.id}`)
        } catch (e) {
          toast.error((e as Error).message)
        }
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/social" />
          <span className="bj-h2">모임 만들기</span>
        </header>

        <ClubForm submitLabel="모임 만들기" onSubmit={handleSubmit} />

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next="/social/clubs/new" />
      </div>
    </main>
  )
}
