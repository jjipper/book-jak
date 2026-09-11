'use client'

import { READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import type { TestResult } from '@/entities/reading-type/model/scoring'
import { RarityBadge } from '@/shared/ui'
import StatBar from '@/shared/ui/StatBar'
import TypeBadge from '@/shared/ui/TypeBadge'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface TypeCardProps {
  typeCode: TypeCode
  result: TestResult
  shareRef?: React.RefObject<HTMLDivElement | null>
}

const STAT_KEYS = ['몰입력', '감수성', '완독력', '인내심', '허세력'] as const

/** 유형 코드 네 글자 → 취향 키워드 칩 */
const AXIS_KEYWORDS: Record<string, string> = {
  F: '감정 이입', T: '논리 분석',
  I: '깊은 몰입', C: '차분한 사색',
  E: '현실 도피', G: '자기 성장',
  R: '현실 기반', W: '환상 세계',
}

/** 뇌구조 세그먼트 농도 — 1순위가 가장 진하다 */
const BRAIN_SHADES = [100, 78, 58, 40, 24]

const brainShade = (i: number) =>
  `color-mix(in srgb, var(--color-accent) ${BRAIN_SHADES[i]}%, var(--color-surface))`

/** 누적 각도로 conic-gradient 하드 스톱을 만든다 */
function brainDonutStops(brain: { pct: number }[]): string[] {
  return brain.map((seg, i) => {
    const from = brain.slice(0, i).reduce((sum, s) => sum + s.pct, 0)
    return `${brainShade(i)} ${from}% ${from + seg.pct}%`
  })
}

export default function TypeCard({ typeCode, result, shareRef }: TypeCardProps) {
  const type = READING_TYPES[typeCode]
  const stats = result.variantStats
  const rarityKey = rarityBadgeVariant(type.rarityLevel)
  const rarityVariant = rarityKey === 'epic' ? 'legendary' : rarityKey

  const donutStops = brainDonutStops(type.brain)
  const top = type.brain[0]

  return (
    <div ref={shareRef} className="bj-typecard">
      {/* 캐릭터 일러스트 + 희소도 스티커 — 유형별 틴트가 위에서 표면색으로 녹아든다 */}
      <div className={`bj-typecard__illust-bg bj-typecard__illust-bg--${typeCode}`}>
        <IllustPlaceholder
          code={type.code}
          alt={type.name}
          aspectRatio="1 / 1"
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
        <TypeBadge code={type.code} />
        <h2 className="bj-display bj-display--xl bj-typecard__name">
          {type.name}
        </h2>
        <p className="bj-typecard__tagline">
          &ldquo;{type.tagline}&rdquo;
        </p>
      </div>

      {/* 취향 키워드 */}
      <div className="bj-typecard__keywords">
        {typeCode.split('').map((axis) => (
          <span key={axis} className="bj-chip">#{AXIS_KEYWORDS[axis]}</span>
        ))}
      </div>

      {/* 스탯 */}
      <div className="bj-typecard__stats">
        <p className="bj-typecard__section-label">독서 스탯</p>
        <div className="bj-typecard__stat-list">
          {STAT_KEYS.map((key) => (
            <StatBar key={key} name={key} value={stats[key]} />
          ))}
        </div>
      </div>

      {/* 뇌구조 */}
      <div className="bj-typecard__brain">
        <p className="bj-typecard__section-label">독서 뇌구조</p>
        <div className="bj-typecard__brain-body">
          <div
            className="bj-brain-donut"
            style={{ background: `conic-gradient(${donutStops.join(',')})` }}
          >
            <span className="bj-brain-donut__hole">
              <span className="bj-brain-donut__value">{top.pct}%</span>
              <span className="bj-brain-donut__label">{top.label}</span>
            </span>
          </div>
          <ul className="bj-typecard__brain-legend">
            {type.brain.map((item, i) => (
              <li key={item.label} className="bj-typecard__brain-row">
                <span
                  className="bj-typecard__brain-dot"
                  style={{ background: brainShade(i) }}
                />
                <span className="bj-typecard__brain-name">{item.label}</span>
                <span className="bj-typecard__brain-pct">{item.pct}%</span>
              </li>
            ))}
          </ul>
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
