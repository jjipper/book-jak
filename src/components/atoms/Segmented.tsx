/* SEGMENTED — 다구간 누적 바 (독서 뇌구조 등)
   구간 구분은 opacity로만 — 색은 --color-fill 하나 (v2 규칙) */

interface SegmentedProps {
  /** 구간 값 목록 (합계 대비 비율로 폭 계산) */
  segments: number[]
  /** 접근성 라벨 */
  label?: string
}

export default function Segmented({ segments, label }: SegmentedProps) {
  const total = segments.reduce((sum, v) => sum + v, 0)
  return (
    <div className="bj-segmented" role="img" aria-label={label}>
      {segments.map((value, i) => (
        <div
          key={i}
          className="bj-segmented__seg"
          style={{
            width: total > 0 ? `${(value / total) * 100}%` : 0,
            opacity: Math.max(0.3, 1 - i * 0.22),
          }}
        />
      ))}
    </div>
  )
}
