'use client'

import { READING_TYPES, rarityBadgeVariant, RARITY_BADGE_LABELS, AXIS_KEYWORDS, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import TypeBadge from '@/shared/ui/TypeBadge'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface TypeCardProps {
  typeCode: TypeCode
}

// ponytail: 설문 응답 수가 아직 집계되지 않아 100명 기준으로 환산한다. 실제 응답 수가 생기면 그 값으로 교체.
const SURVEY_COUNT = 100

export default function TypeCard({ typeCode }: TypeCardProps) {
  const type = READING_TYPES[typeCode]
  const rarityKey = rarityBadgeVariant(type.rarityLevel)

  return (
    <div className="bj-typecard">
      {/* 캐릭터 일러스트 + 희소도 스티커 — 유형별 틴트가 위에서 표면색으로 녹아든다 */}
      <div className={`bj-typecard__illust-bg bj-typecard__illust-bg--${typeCode}`}>
        <IllustPlaceholder
          code={type.code}
          alt={type.name}
          aspectRatio="1 / 1"
          fit="contain"
          background="transparent"
        />
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

      {/* 희소도 */}
      <div className="bj-typecard__rarity">
        <p className="bj-display bj-typecard__rarity-head">
          {RARITY_BADGE_LABELS[rarityKey]} {type.rarityPct}%
        </p>
        <p className="bj-typecard__rarity-sub">
          {SURVEY_COUNT}명 중 {Math.round((SURVEY_COUNT * type.rarityPct) / 100)}명이 이 유형이에요!
        </p>
      </div>

      {/* 푸터 */}
      <div className="bj-typecard__footer">
        <span className="bj-display bj-typecard__footer-brand">
          북작
        </span>
        <span className="bj-caption bj-typecard__footer-caption">
          나의 BOOKBTI
        </span>
      </div>
    </div>
  )
}
