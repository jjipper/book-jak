/* SEGMENTED — 다구간 누적 바 (독서 뇌구조 등)
   색은 --color-fill(주황) 하나, 농도 단계만 opacity로 — #F0562E → #F58B6B → #F9B9A4 → #FBDFD5.
   5번째부터는 투명(=트랙 #F2EEE4 그대로). */

/* 주황을 흰 면 위에 섞었을 때 시안 4단계가 나오는 불투명도 */
const DENSITY = [1, 0.67, 0.4, 0.27]

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
            opacity: DENSITY[i] ?? 0,
          }}
        />
      ))}
    </div>
  )
}
