import type { SelectHTMLAttributes } from 'react'

/* 필터 셀렉트 FilterSelect — 네이티브 <select>에 .bj-select(화이트 면 · 라운드 8 · 높이 28 · 14 Regular + caret)만 입힌다.
   옵션은 children으로 <option>을 그대로 넘긴다. */

export default function FilterSelect({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={['bj-select', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </select>
  )
}
