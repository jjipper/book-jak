// 읽기 전용 별점 표시 — 0.5 단위 반점 렌더링, 입력용은 components/discover/StarRating 사용

interface StarsProps {
  value: number // 0~5, 소수 허용 (0.5 단위로 반올림해서 표시)
  size?: number
}

const STAR_POINTS = '12 2 15.09 8.63 22 9.27 16.5 13.97 18.18 21 12 17.27 5.82 21 7.5 13.97 2 9.27 8.91 8.63 12 2'

export default function Stars({ value, size = 14 }: StarsProps) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span style={{ display: 'inline-flex', gap: 2, lineHeight: 0 }} aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const frac = Math.max(0, Math.min(1, rounded - (n - 1)))
        return (
          <span key={n} style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
            <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.5" strokeLinejoin="round">
              <polygon points={STAR_POINTS} />
            </svg>
            {frac > 0 && (
              <span style={{ position: 'absolute', left: 0, top: 0, width: `${frac * 100}%`, height: '100%', overflow: 'hidden' }}>
                <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--color-action)" stroke="var(--color-action)" strokeWidth="1.5" strokeLinejoin="round">
                  <polygon points={STAR_POINTS} />
                </svg>
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
