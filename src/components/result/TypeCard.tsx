'use client'

import { useEffect, useRef } from 'react'
import { READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS, type TypeCode } from '@/data/readingTypes'
import type { TestResult } from '@/lib/scoring'
import { illustGradient } from '@/data/illustGradients'
import { RarityBadge } from '@/components/atoms'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

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

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: 'var(--color-action)', marginBottom: 10,
    display: 'flex', alignItems: 'center', gap: 8,
  }

  return (
    <div
      ref={shareRef}
      style={{
        width: '100%',
        background: 'var(--color-surface)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}
    >
      {/* 상단 바 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '14px 18px' }}>
        <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em' }}>
          {type.code}
        </span>
      </div>

      {/* 캐릭터 일러스트 + 희소도 스티커 — 유형별 틴트가 위에서 표면색으로 녹아든다 */}
      <div style={{ position: 'relative', padding: '12px 18px 0', background: illustGradient(typeCode) }}>
        <IllustPlaceholder
          code={type.code}
          alt={type.name}
          aspectRatio="4 / 3"
          fit="contain"
          background="transparent"
        />
        <span style={{ position: 'absolute', top: 4, left: 20 }}>
          <RarityBadge
            variant={rarityVariant}
            label={RARITY_BADGE_LABELS[rarityKey]}
            sub={`${type.rarityPct}%`}
            size="sm"
          />
        </span>
      </div>

      {/* 이름 */}
      <div style={{ padding: '18px 20px 6px', textAlign: 'center' }}>
        <h2 className="bj-display bj-display--xl">
          {type.name}
        </h2>
        <p className="bj-body" style={{ marginTop: 8, fontSize: 13, color: 'var(--color-text-muted)' }}>
          &ldquo;{type.tagline}&rdquo;
        </p>
      </div>

      {/* 스탯 */}
      <div style={{ padding: '14px 20px 0' }}>
        <div style={sectionLabelStyle}>
          독서 스탯
          <span className="bj-section-label__line" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {STAT_KEYS.map((key, i) => (
            <div key={key} className="bj-stat">
              <div className="bj-stat__head">
                <span>{key}</span>
                <span className="bj-stat__value">{stats[key]}</span>
              </div>
              <div className="bj-stat__track">
                <div
                  ref={(el) => { fillRefs.current[i] = el }}
                  className="bj-stat__fill"
                  style={{ width: '0%', transition: 'width 0.7s cubic-bezier(0.2,0.7,0.3,1)' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 뇌구조 */}
      <div style={{ padding: '16px 20px 20px' }}>
        <div style={sectionLabelStyle}>
          독서 뇌구조
          <span className="bj-section-label__line" />
        </div>
        <div className="bj-segmented" style={{ marginBottom: 12 }}>
          {type.brain.map((seg, i) => (
            <div key={seg.label} className="bj-segmented__seg" style={{ width: seg.pct + '%', opacity: brainShades[i] }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {type.brain.map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                width: 9, height: 9, borderRadius: 2, flexShrink: 0,
                background: 'var(--color-fill)', opacity: brainShades[i], display: 'inline-block',
              }} />
              <span className="bj-caption" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text)' }}>{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px',
        borderTop: '1px dashed var(--color-border)',
      }}>
        <span className="bj-display" style={{ fontSize: 14, letterSpacing: '0.18em' }}>
          북작
        </span>
        <span className="bj-caption" style={{ letterSpacing: '0.1em' }}>
          나의 독서유형
        </span>
      </div>
    </div>
  )
}
