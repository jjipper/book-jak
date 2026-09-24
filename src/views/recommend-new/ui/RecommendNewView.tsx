'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRecRequest } from '@/entities/recommendation/api/recommendationsRemote'
import type { RecKind } from '@/entities/recommendation/model/recommendations'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'

// 두 종류는 같은 폼을 쓰고 카피만 다르다 (DB rec_requests.kind)
const COPY: Record<RecKind, {
  head: string; titleLabel: string; titlePlaceholder: string
  moodPlaceholder: string; hint: string; submit: string
}> = {
  ask: {
    head: '추천 받고 싶어요',
    titleLabel: '어떤 책을 찾고 있나요',
    titlePlaceholder: '예: 비 오는 날 읽을 책 추천받아요',
    moodPlaceholder: '어떤 분위기를 찾는지 한 줄로',
    hint: '다른 사람들이 이 목록에 책을 채워줘요',
    submit: '추천 받고 싶어요',
  },
  share: {
    head: '내 추천 목록 만들기',
    titleLabel: '목록 제목',
    titlePlaceholder: '예: 울고 싶을 때 보는 책 5선',
    moodPlaceholder: '어떤 사람에게 권하는지 한 줄로',
    hint: '만든 뒤 내가 책을 담아요. 다른 사람은 읽을게요·서재에 담기·후기만 남겨요',
    submit: '내 추천 목록 만들기',
  },
}

export default function RecommendNewView({ kind = 'ask' }: { kind?: RecKind }) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [mood, setMood] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const copy = COPY[kind]

  const canSubmit = title.trim().length >= 2 && !submitting

  function handleSubmit() {
    if (!canSubmit) return
    requireAuth(() => {
      requireNickname(async () => {
        setSubmitting(true)
        try {
          const id = await createRecRequest(kind, title.trim(), mood.trim())
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
          <span className="bj-h2">{copy.head}</span>
        </header>

        <div className="bj-content--new">
          <div>
            <p className="bj-caption bj-bold bj-mb-8">{copy.titleLabel}</p>
            <input
              type="text"
              className="bj-input"
              placeholder={copy.titlePlaceholder}
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className="bj-caption bj-bold bj-mb-8">설명 (선택)</p>
            <input
              type="text"
              className="bj-input"
              placeholder={copy.moodPlaceholder}
              maxLength={100}
              value={mood}
              onChange={(e) => setMood(e.target.value)}
            />
          </div>

          <p className="bj-caption bj-text-muted">{copy.hint} · 내 BOOKBTI가 함께 표시돼요</p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
          >
            {copy.submit}
          </button>
        </div>

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/recommend/new?kind=${kind}`} />
      </div>
    </main>
  )
}
