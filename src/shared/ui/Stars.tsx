// 읽기 전용 별점 표시 — 0.5 단위 반점 렌더링, 입력용은 StarRating 사용

import { STAR_PATH } from './Icon'

interface StarsProps {
  value: number // 0~5, 소수 허용 (0.5 단위로 반올림해서 표시)
  /** 행 안(RateRow·BookRow)은 16. 입력용 StarRating은 24 */
  size?: number
}

/* 일러스트 별 한 개 — 빈칸 눌림(트랙) / 채움 주황500. frac 만큼 왼쪽부터 채운다 */
export function Star({ frac, size }: { frac: number; size: number }) {
  return (
    <span className="bj-star" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--color-track)" aria-hidden="true">
        <path d={STAR_PATH} />
      </svg>
      {frac > 0 && (
        <span className="bj-star__fill" style={{ clipPath: `inset(0 ${(1 - frac) * 100}% 0 0)` }}>
          <svg width={size} height={size} viewBox="0 0 24 24" fill="var(--color-accent)" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        </span>
      )}
    </span>
  )
}

export default function Stars({ value, size = 16 }: StarsProps) {
  const rounded = Math.round(value * 2) / 2
  return (
    <span className="bj-stars" aria-label={`별점 ${value}점`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} frac={Math.max(0, Math.min(1, rounded - (n - 1)))} size={size} />
      ))}
    </span>
  )
}
