'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRecRequest } from '@/entities/recommendation/api/recommendationsRemote'
import type { PostBook } from '@/entities/post/api/postsRemote'
import BookPicker from '@/features/post-compose/ui/BookPicker'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'

export default function RecommendNewView() {
  const router = useRouter()
  const [mood, setMood] = useState('')
  const [book, setBook] = useState<PostBook | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()

  const canSubmit = mood.trim().length >= 2 && !submitting

  function handleSubmit() {
    if (!canSubmit) return
    requireAuth(() => {
      requireNickname(async () => {
        setSubmitting(true)
        try {
          const id = await createRecRequest(mood.trim(), book)
          router.push(`/social/recommend/${id}`)
        } catch (e) {
          toast.error((e as Error).message)
          setSubmitting(false)
        }
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/social?tab=recommend" />
          <span className="bj-h2">책 추천 받기</span>
        </header>

        <div className="bj-content--new">
          <div>
            <p className="bj-caption bj-bold bj-mb-8">요즘 읽고 싶은 분위기</p>
            <input
              type="text"
              className="bj-input"
              placeholder="예: 비 오는 날 이불 속에서 읽을 잔잔한 소설"
              maxLength={100}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <div>
            <p className="bj-caption bj-bold bj-mb-8">최근 좋았던 책 (선택)</p>
            <BookPicker value={book} onChange={setBook} />
          </div>

          <p className="bj-caption bj-text-muted">내 BOOKBTI가 요청에 함께 표시돼요</p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
          >
            추천 요청하기
          </button>
        </div>

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next="/social/recommend/new" />
      </div>
    </main>
  )
}
