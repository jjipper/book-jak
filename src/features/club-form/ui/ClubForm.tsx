'use client'

import { useState } from 'react'
import { CLUB_TAGS, CLUB_ILLUSTS, type ClubFormat, type ClubIllustCode } from '@/entities/club/model/clubs'
import type { ClubInput } from '@/entities/club/model/clubActions'

const CAPACITY_OPTIONS = [4, 6, 8, 10]
const FORMAT_OPTIONS: ClubFormat[] = ['온라인', '오프라인']

// <input type="datetime-local">은 로컬 시각 문자열만 다룬다. DB는 ISO(UTC).
function toLocalInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function ClubForm({
  initial,
  minCapacity = 0,
  submitLabel,
  onSubmit,
}: {
  initial?: ClubInput
  /** 현재 참여 인원 — 이보다 작은 정원은 고를 수 없다 (0021 체크 제약과 같은 규칙) */
  minCapacity?: number
  submitLabel: string
  onSubmit: (values: ClubInput) => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [capacity, setCapacity] = useState(initial?.capacity ?? 6)
  const [format, setFormat] = useState<ClubFormat>(initial?.format ?? '온라인')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [startsAt, setStartsAt] = useState(toLocalInput(initial?.startsAt))
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [illust, setIllust] = useState<ClubIllustCode | undefined>(initial?.illust)

  const canSubmit = name.trim().length > 0 && description.trim().length > 0

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function handleSubmit() {
    if (!canSubmit) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      tags,
      capacity,
      format,
      region: region.trim() || undefined,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      illust,
    })
  }

  return (
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
        <p className="bj-caption bj-bold bj-mb-8">모임 소개</p>
        <textarea
          className="bj-textarea bj-textarea--tall"
          placeholder={'어떤 모임인지 자세히 알려주세요\n어떤 책을 읽는지, 언제 어떻게 만나는지, 어떤 사람과 함께하고 싶은지'}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="bj-caption bj-text-muted">{description.length}/2000</p>
      </div>

      <div>
        <p className="bj-caption bj-bold bj-mb-8">모임 분위기</p>
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
                <img src={`/assets/illust/club/${code}.png`} alt={label} className="bj-illust-pick__img" />
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
              disabled={n < minCapacity}
              onClick={() => setCapacity(n)}
              className={`bj-choice bj-choice--flex bj-text-center${capacity === n ? ' is-active' : ''}`}
            >
              {n}명
            </button>
          ))}
        </div>
        {minCapacity > 0 && (
          <p className="bj-caption bj-text-muted">이미 {minCapacity}명이 참여 중이라 정원을 그보다 줄일 수 없어요</p>
        )}
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

      {format === '오프라인' && (
        <div>
          <p className="bj-caption bj-bold bj-mb-8">지역</p>
          <input
            type="text"
            className="bj-input"
            placeholder="예: 서울 합정"
            maxLength={40}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </div>
      )}

      <div>
        <p className="bj-caption bj-bold bj-mb-8">일시 (선택)</p>
        <input
          type="datetime-local"
          className="bj-input"
          value={startsAt}
          onChange={(e) => setStartsAt(e.target.value)}
        />
      </div>

      <div>
        <p className="bj-caption bj-bold bj-mb-8">태그 (여러 개 가능)</p>
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
        {submitLabel}
      </button>
    </div>
  )
}
