'use client'

// 별점 입력 — 0.5점 단위 지원 (별의 왼쪽 절반 = 반점, 오른쪽 절반 = 온점)
// 현재 값과 같은 지점을 다시 누르면 취소(0점)된다.

import { useState } from 'react'
import { Star } from './Stars'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  /** 시안 24 · 간격 6 */
  size?: number
}

export default function StarRating({ value, onChange, size = 24 }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  function pointValue(n: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return e.clientX - rect.left < rect.width / 2 ? n - 0.5 : n
  }

  return (
    <div className="bj-star-rating" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="bj-star-btn no-drag"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            const v = pointValue(n, e)
            onChange(v === value ? 0 : v)
          }}
          onMouseMove={(e) => setHover(pointValue(n, e))}
          aria-label={`${n}점`}
        >
          <Star frac={Math.max(0, Math.min(1, display - (n - 1)))} size={size} />
        </button>
      ))}
    </div>
  )
}
