// Phase 3 — 취향 유사도 계산 (compare 페이지 · social 페이지 공용)

import { READING_TYPES, type TypeCode } from '@/data/readingTypes'

export function calcAffinity(a: TypeCode, b: TypeCode): number {
  const typeA = READING_TYPES[a]
  if (typeA.compatibility.match === b) return 97
  if (typeA.compatibility.opposite === b) return 18
  const codeA = a.split('')
  const codeB = b.split('')
  const matches = codeA.filter((c, i) => c === codeB[i]).length
  return 40 + matches * 15
}

export function affinityLabel(n: number): string {
  if (n >= 90) return '환상의 독서 파트너'
  if (n >= 70) return '꽤 잘 맞는 편'
  if (n >= 50) return '달라서 재밌는 사이'
  return '정반대, 근데 그래서 티키타카'
}
