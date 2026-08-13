'use client'

import { useEffect, useRef } from 'react'
import { READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import type { TestResult } from '@/entities/reading-type/model/scoring'
import { RarityBadge } from '@/shared/ui'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface TypeCardProps {
  typeCode: TypeCode
  result: TestResult
  shareRef?: React.RefObject<HTMLDivElement | null>
}

const STAT_KEYS = ['몰입력', '감수성', '완독력', '인내심', '허세력'] as const

export default function TypeCard({ typeCode, result, shareRef }: TypeCardProps) {
  const type = READING_TYPES[typeCode]
  const stats = result.variantStats
  const rarityKey = rarityBadgeVariant(type.rarityLevel)
  const rarityVariant = rarityKey === 'epic' ? 'legendary' : rarityKey
  const fillRefs = useRef<(HTMLDivElement | null)[]>([])

  // 스탯 바 애니메이션
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    STAT_KEYS.forEach((key, i) => {
      const el = fillRefs.current[i]
      if (!el) return
      el.style.width = '0%'
      timers.push(setTimeout(() => { el.style.width = stats[key] + '%' }, 150 + i * 80))
    })
    return () => timers.forEach(clearTimeout)
  }, [stats])

  const brainShades = [1, 0.78, 0.58, 0.4, 0.24]

  return (
    <div ref={shareRef} className="bj-typecard">
      {/* 상단 바 */}
      <div className="bj-typecard__topbar">
        <span className="bj-caption bj-bold bj-typecard__topbar-code">
          {type.code}
        </span>
      </div>

      {/* 캐릭터 일러스트 + 희소도 스티커 — 유형별 틴트가 위에서 표면색으로 녹아든다 */}
      <div className={`bj-typecard__illust-bg bj-typecard__illust-bg--${typeCode}`}>
        <IllustPlaceholder
          code={type.code}
          alt={type.name}
          aspectRatio="4 / 3"
          fit="contain"
          background="transparent"
        />
        <span className="bj-typecard__rarity-slot">
          <RarityBadge
            variant={rarityVariant}
            label={RARITY_BADGE_LABELS[rarityKey]}
            sub={`${type.rarityPct}%`}
            size="sm"
          />
        </span>
      </div>

      {/* 이름 */}
      <div className="bj-typecard__name-block">
        <h2 className="bj-display bj-display--xl">
          {type.name}
        </h2>
        <p className="bj-body bj-typecard__tagline">
          &ldquo;{type.tagline}&rdquo;
        </p>
      </div>

      {/* 스탯 */}
      <div className="bj-typecard__stats">
        <div className="bj-card-section-head--mb10 bj-typecard__section-label">
          독서 스탯
          <span className="bj-section-label__line" />
        </div>
        <div className="bj-col-10">
          {STAT_KEYS.map((key, i) => (
            <div key={key} className="bj-stat">
              <div className="bj-stat__head">
                <span>{key}</span>
                <span className="bj-stat__value">{stats[key]}</span>
              </div>
              <div className="bj-stat__track">
                <div
                  ref={(el) => { fillRefs.current[i] = el }}
                  className="bj-stat__fill bj-stat__fill--animated"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 뇌구조 */}
      <div className="bj-typecard__brain">
        <div className="bj-card-section-head--mb10 bj-typecard__section-label">
          독서 뇌구조
          <span className="bj-section-label__line" />
        </div>
        <div className="bj-segmented bj-typecard__brain-segmented">
          {type.brain.map((seg, i) => (
            <div key={seg.label} className="bj-segmented__seg" style={{ width: seg.pct + '%', opacity: brainShades[i] }} />
          ))}
        </div>
        <div className="bj-typecard__brain-legend">
          {type.brain.map((item, i) => (
            <div key={item.label} className="bj-typecard__brain-row">
              <span className="bj-typecard__brain-dot" style={{ opacity: brainShades[i] }} />
              <span className="bj-caption bj-flex-1 bj-truncate">
                {item.label}
              </span>
              <span className="bj-typecard__brain-pct">{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div className="bj-typecard__footer">
        <span className="bj-display bj-typecard__footer-brand">
          북작
        </span>
        <span className="bj-caption bj-typecard__footer-caption">
          나의 독서유형
        </span>
      </div>
    </div>
  )
}
