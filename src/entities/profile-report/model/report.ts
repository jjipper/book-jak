// 취향 리포트 계산 — 전부 순수 함수. 데이터 수집은 api/reportRemote.ts가 한다.

import { AXIS_KEYWORDS, READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import type { TestResult } from '@/entities/reading-type/model/scoring'
import type { BookRatingRecord } from '@/entities/book-rating/model/bookRatings'

/** 4축 스펙트럼 한 줄 — 왼쪽 글자가 leftPct만큼 차지한다 */
export interface AxisSpectrum {
  left: string
  right: string
  leftLabel: string
  rightLabel: string
  /** 0~100. 왼쪽 글자 쪽 비중 */
  leftPct: number
  /** 실제로 내 유형에 채택된 글자 */
  picked: string
}

const AXIS_PAIRS: [string, string][] = [['F', 'T'], ['I', 'C'], ['E', 'G'], ['R', 'W']]

export function buildSpectrum(result: TestResult): AxisSpectrum[] {
  const scores = result.axisScores as unknown as Record<string, Record<string, number>>
  return AXIS_PAIRS.map(([left, right], i) => {
    const pair = scores[left + right] ?? {}
    const l = pair[left] ?? 0
    const r = pair[right] ?? 0
    const picked = result.typeCode[i]
    // 서버에서 유형만 복원한 경우 축 점수가 전부 0이다 → 채택된 글자 쪽으로 몰아서 그린다
    const leftPct = l + r === 0 ? (picked === left ? 100 : 0) : Math.round((l / (l + r)) * 100)
    return {
      left,
      right,
      leftLabel: AXIS_KEYWORDS[left],
      rightLabel: AXIS_KEYWORDS[right],
      leftPct,
      picked,
    }
  })
}

export interface GenreSlice {
  name: string
  count: number
  /** 전체 읽은 책 대비 % (반올림, 합이 100이 되도록 마지막에 보정) */
  pct: number
}

/** 장르 비율 — 장르를 아는 책만 분모로 쓴다(분모를 밝혀서 오해를 막는다) */
export function buildGenres(ratings: BookRatingRecord[]): { slices: GenreSlice[]; total: number } {
  const counts = new Map<string, number>()
  for (const r of ratings) {
    if (!r.categoryName) continue
    counts.set(r.categoryName, (counts.get(r.categoryName) ?? 0) + 1)
  }
  const total = [...counts.values()].reduce((a, b) => a + b, 0)
  if (total === 0) return { slices: [], total: 0 }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1])
  // 6번째부터는 '기타'로 묶는다 — 도넛 조각이 실처럼 가늘어지면 읽을 수 없다
  const head = sorted.slice(0, 5)
  const tail = sorted.slice(5)
  const rows = tail.length
    ? [...head, ['기타', tail.reduce((sum, [, c]) => sum + c, 0)] as [string, number]]
    : head

  const slices = rows.map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
  const drift = 100 - slices.reduce((sum, s) => sum + s.pct, 0)
  if (slices.length) slices[0].pct += drift
  return { slices, total }
}

export interface StarProfile {
  avg: number
  /** 1~5점 각각의 권수 */
  distribution: [number, number, number, number, number]
  label: string
  note: string
}

export function buildStarProfile(ratings: BookRatingRecord[]): StarProfile {
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0]
  for (const r of ratings) {
    const i = Math.min(5, Math.max(1, Math.round(r.stars))) - 1
    distribution[i] += 1
  }
  const avg = ratings.length ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length : 0
  const top = distribution[3] + distribution[4]
  const spread = ratings.length ? top / ratings.length : 0

  let label = '균형 잡힌 독자'
  let note = '좋은 책엔 별을 주고, 아닌 책엔 안 준다'
  if (!ratings.length) {
    label = '아직 별점 전'
    note = '책에 별점을 남기면 성향이 보여요'
  } else if (avg >= 4.2) {
    label = '후한 독자'
    note = `읽은 책의 ${Math.round(spread * 100)}%에 별 4개 이상을 줬어요`
  } else if (avg <= 2.8) {
    label = '깐깐한 독자'
    note = '별 다섯은 아무한테나 주지 않는다'
  }
  return { avg, distribution, label, note }
}

export interface DiscoveryProfile {
  saved: number
  passed: number
  /** 0~100. 담기 비율 */
  savePct: number
  label: string
  note: string
}

export function buildDiscovery(saved: number, passed: number): DiscoveryProfile {
  const total = saved + passed
  const savePct = total ? Math.round((saved / total) * 100) : 0
  if (!total) return { saved, passed, savePct: 0, label: '아직 탐색 전', note: '발견 탭에서 블라인드 북을 만나보세요' }
  if (savePct >= 60) return { saved, passed, savePct, label: '모험가', note: '낯선 책도 일단 서재로' }
  if (savePct <= 30) return { saved, passed, savePct, label: '신중파', note: '고르고 골라 담는 편' }
  return { saved, passed, savePct, label: '균형파', note: '끌리는 것만 골라 담아요' }
}

/** 취향 키워드 — 유형 4축 키워드 + 많이 읽은 장르 */
export function buildKeywords(typeCode: TypeCode | null, slices: GenreSlice[]): string[] {
  const fromType = typeCode ? typeCode.split('').map((c) => AXIS_KEYWORDS[c]) : []
  const fromGenre = slices.filter((s) => s.name !== '기타').slice(0, 3).map((s) => s.name)
  return [...new Set([...fromType, ...fromGenre])]
}

export function typeRarityPct(typeCode: TypeCode | null): number | null {
  return typeCode ? READING_TYPES[typeCode].rarityPct : null
}
