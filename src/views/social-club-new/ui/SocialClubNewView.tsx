'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClub } from '@/entities/club/model/clubActions'
import { CLUB_TAGS, type ClubFormat } from '@/entities/club/model/clubs'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'

const CAPACITY_OPTIONS = [4, 6, 8, 10]
const FORMAT_OPTIONS: ClubFormat[] = ['온라인', '오프라인']

export default function SocialClubNewView() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [capacity, setCapacity] = useState(6)
  const [format, setFormat] = useState<ClubFormat>('온라인')
  const [tags, setTags] = useState<string[]>([])
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()

  const canSubmit = name.trim().length > 0 && description.trim().length > 0

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleSubmit() {
    if (!canSubmit) return
    requireNickname(() => {
      const club = createClub({ name: name.trim(), description: description.trim(), tags, capacity, format })
      router.push(`/social/clubs/${club.id}`)
    })
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social/clubs" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">모임 만들기</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>모임 이름</p>
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
          <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>한 줄 소개</p>
          <textarea
            className="bj-textarea"
            placeholder="어떤 모임인지 소개해주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ minHeight: 72 }}
          />
        </div>

        <div>
          <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>정원</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {CAPACITY_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCapacity(n)}
                className={`bj-choice${capacity === n ? ' is-active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
              >
                {n}명
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>형태</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {FORMAT_OPTIONS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={`bj-choice${format === f ? ' is-active' : ''}`}
                style={{ flex: 1, textAlign: 'center', padding: '10px 0' }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>태그 (여러 개 선택 가능)</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CLUB_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`bj-chip${tags.includes(tag) ? ' bj-chip--active' : ''}`}
                style={{ border: '1px solid var(--color-border)', cursor: 'pointer', padding: '6px 12px' }}
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
          className="bj-btn bj-btn--primary bj-btn--block"
          style={{ padding: '14px 0', opacity: canSubmit ? 1 : 0.4, cursor: canSubmit ? 'pointer' : 'not-allowed' }}
        >
          모임 만들기
        </button>
      </div>

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
    </main>
  )
}
