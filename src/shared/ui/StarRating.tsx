'use client'

// 별점 입력 — 0.5점 단위 지원 (별의 왼쪽 절반 = 반점, 오른쪽 절반 = 온점)
// 현재 값과 같은 지점을 다시 누르면 취소(0점)된다.

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
  size?: number
}

const STAR_POINTS = '12 2 15.09 8.63 22 9.27 16.5 13.97 18.18 21 12 17.27 5.82 21 7.5 13.97 2 9.27 8.91 8.63 12 2'

function Star({ frac, size }: { frac: number; size: number }) {
  return (
    <span className="bj-star" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-caption)" strokeWidth="1.5" strokeLinejoin="round">
        <polygon points={STAR_POINTS} />
      </svg>
      {frac > 0 && (
        <span className="bj-star__fill" style={{ clipPath: `inset(0 ${(1 - frac) * 100}% 0 0)` }}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinejoin="round">
            <polygon points={STAR_POINTS} />
          </svg>
        </span>
      )}
    </span>
  )
}

export default function StarRating({ value, onChange, size = 26 }: StarRatingProps) {
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
