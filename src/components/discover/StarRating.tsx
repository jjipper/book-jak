'use client'

import { useState } from 'react'

interface StarRatingProps {
  value: number
  onChange: (value: number) => void
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill={filled ? 'var(--color-action)' : 'none'} stroke={filled ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="1.5" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.63 22 9.27 16.5 13.97 18.18 21 12 17.27 5.82 21 7.5 13.97 2 9.27 8.91 8.63 12 2" />
    </svg>
  )
}

export default function StarRating({ value, onChange }: StarRatingProps) {
  const [hover, setHover] = useState(0)
  const display = hover || value

  return (
    <div style={{ display: 'flex', gap: 6 }} onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="no-drag"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          style={{ background: 'none', border: 'none', padding: 2, cursor: 'pointer', lineHeight: 0 }}
          aria-label={`${n}점`}
        >
          <StarIcon filled={n <= display} />
        </button>
      ))}
    </div>
  )
}
