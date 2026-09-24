'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadClub, updateClub, type ClubInput } from '@/entities/club/model/clubActions'
import type { BookClub } from '@/entities/club/model/clubs'
import ClubForm from '@/features/club-form/ui/ClubForm'
import { getMyId } from '@/entities/user/model/profile'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'

export default function SocialClubEditView() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [club, setClub] = useState<BookClub | null>(null)
  const detail = `/social/clubs/${params.id}`

  // 주최자가 아니면 상세로 돌려보낸다 (RLS도 같은 조건으로 막지만, 화면을 먼저 닫는다)
  useEffect(() => {
    void loadClub(params.id).then((c) => {
      if (!c || c.organizerId !== getMyId()) {
        toast.error('주최자만 수정할 수 있어요')
        router.replace(detail)
        return
      }
      setClub(c)
    })
  }, [params.id, router, detail])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href={detail} />
          <span className="bj-h2">모임 수정</span>
        </header>

        {club && (
          <ClubForm
            initial={club}
            minCapacity={club.memberCount}
            submitLabel="수정 저장"
            onSubmit={(values: ClubInput) => {
              void (async () => {
                try {
                  await updateClub(club.id, values)
                  router.push(detail)
                } catch (e) {
                  toast.error((e as Error).message)
                }
              })()
            }}
          />
        )}
      </div>
    </main>
  )
}
