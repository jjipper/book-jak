/* 세그 탭 SegTab — 크림 pill 40 안에 1:1 세그(32 pill). 활성 화이트 14 Bold / 기본 14 Medium 잉크400.
   선택 상태는 호출부가 갖는다(value/onChange). */

interface SegTabProps<T extends string> {
  items: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  /** 접근성 라벨 */
  label?: string
}

export default function SegTab<T extends string>({ items, value, onChange, label }: SegTabProps<T>) {
  return (
    <div className="bj-segtab" role="tablist" aria-label={label}>
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            className={`bj-segtab__seg${active ? ' bj-segtab__seg--active' : ''}`}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
