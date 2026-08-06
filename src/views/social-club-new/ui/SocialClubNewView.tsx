'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClub } from '@/entities/club/model/clubActions'
import { CLUB_TAGS, CLUB_ILLUSTS, type ClubFormat, type ClubIllustCode } from '@/entities/club/model/clubs'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

const CAPACITY_OPTIONS = [4, 6, 8, 10]
const FORMAT_OPTIONS: ClubFormat[] = ['온라인', '오프라인']

export default function SocialClubNewView() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(6)
  const [format, setFormat] = useState<ClubFormat>('온라인')
  const [tags, setTags] = useState<string[]>([])
  const [illust, setIllust] = useState<ClubIllustCode | undefined>(undefined)
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()

  const canSubmit = name.trim().length > 0 && description.trim().length > 0

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleSubmit() {
    if (!canSubmit) return
    requireAuth(() => {
      requireNickname(async () => {
        const club = await createClub({ name: name.trim(), description: description.trim(), tags, capacity, format, illust })
        router.push(`/social/clubs/${club.id}`)
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social/clubs" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">모임 만들기</span>
      </header>

      <div className="bj-content--new">
        <div>
          <p className="bj-caption bj-bold bj-mb-8">모임 이름</p>
          <input
            type="text"
            className="bj-input"
            placeholder="예: 새벽 판타지 클럽"
            maxLength={24}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <p className="bj-caption bj-bold bj-mb-8">한 줄 소개</p>
          <textarea
            className="bj-textarea bj-textarea--sm"
            placeholder="어떤 모임인지 소개해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <p className="bj-caption bj-bold bj-mb-8">모임 분위기 선택</p>
          <div className="bj-illust-grid">
            {CLUB_ILLUSTS.map(({ code, label }) => {
              const active = illust === code
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setIllust(active ? undefined : code)}
                  className={`bj-illust-pick${active ? ' bj-illust-pick--active' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/assets/illust/club/${code}.png`}
                    alt={label}
                    className="bj-illust-pick__img"
                  />
                  <span className={`bj-caption bj-illust-pick__label${active ? ' bj-illust-pick__label--active' : ''}`}>
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <p className="bj-caption bj-bold bj-mb-8">정원</p>
          <div className="bj-choice-row">
            {CAPACITY_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCapacity(n)}
                className={`bj-choice bj-choice--flex bj-text-center${capacity === n ? ' is-active' : ''}`}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="bj-caption bj-bold bj-mb-8">형태</p>
          <div className="bj-choice-row">
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`bj-choice bj-choice--flex bj-text-center${format === f ? ' is-active' : ''}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="bj-caption bj-bold bj-mb-8">태그 (여러 개 선택 가능)</p>
          <div className="bj-tag-group">
            {CLUB_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`bj-chip bj-chip--outline${tags.includes(tag) ? ' bj-chip--active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
        >
          모임 만들기
        </button>
      </div>

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
      <LoginGateSheet open={showGate} onClose={closeGate} next="/social/clubs/new" />
      </div>
    </main>
  )
}
