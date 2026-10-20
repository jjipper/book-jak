'use client'

import { useEffect, useRef, useState } from 'react'
import type { Badge } from '@/entities/reading-type/model/badges'
import Icon from '@/shared/ui/Icon'

/* 배지 한 칸 — Figma 02 Components > 배지 메달 BadgeMedal
   88 원 + 간격 6 + 이름 14. 획득은 /assets/badge/{key}.webp,
   아직 없으면 등급별 기본 도형 + 이니셜로 대체한다
   (IllustPlaceholder와 같은 onError + naturalWidth 재확인 패턴).
   미획득은 차트 트랙 원 + lock 아이콘만 — 그림은 숨긴다. */

/** 한글은 첫 글자, 영문 key는 첫 두 글자 */
function initial(badge: Badge): string {
  return badge.name.trim().slice(0, 1)
}

export default function BadgeMedal({ badge, unlocked }: { badge: Badge; unlocked: boolean }) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) setFailed(true)
  }, [])

  return (
    <div className={`bj-medal bj-medal--${badge.tier}${unlocked ? '' : ' bj-medal--locked'}`}>
      <div className="bj-medal__art">
        {!unlocked ? (
          <Icon name="lock" size={24} />
        ) : !failed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={imgRef}
            src={`/assets/badge/${badge.image}`}
            alt=""
            className="bj-medal__img"
            onError={() => setFailed(true)}
          />
        ) : (
          <svg viewBox="0 0 64 64" className="bj-medal__fallback" aria-hidden="true">
            {badge.tier === 'legendary' ? (
              <polygon points="32,3 39,22 59,22 43,34 49,54 32,42 15,54 21,34 5,22 25,22" />
            ) : badge.tier === 'rare' ? (
              <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" />
            ) : (
              <circle cx="32" cy="32" r="28" />
            )}
            <text x="32" y="32" className="bj-medal__fallback-text">{initial(badge)}</text>
          </svg>
        )}
      </div>
      <p className="bj-medal__name">{badge.name}</p>
      <p className="bj-medal__cond">{unlocked ? badge.desc : badge.condition}</p>
    </div>
  )
}
