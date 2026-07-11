import { QUESTIONS, type AxisValue } from '@/data/questions'
import { READING_TYPES, type TypeCode, type StatKey } from '@/data/readingTypes'
import { recordActivity } from '@/lib/activity'

// ────────────────────────────────────────────
// 1. 타입 정의
// ────────────────────────────────────────────

export interface TestAnswer {
  questionId: number
  selectedOptionId: string   // 'A' | 'B' | 'C' | 'D'
  value: AxisValue
  badgeKey?: string
}

export interface AxisScores {
  FT: { F: number; T: number }
  IC: { I: number; C: number }
  EG: { E: number; G: number }
  RW: { R: number; W: number }
}

export interface TestResult {
  typeCode: TypeCode
  axisScores: AxisScores
  variantStats: Record<StatKey, number>
  badgeCandidates: string[]
}

// ────────────────────────────────────────────
// 2. 채점 메인 함수
// ────────────────────────────────────────────

export function scoreTest(answers: TestAnswer[]): TestResult {
  const axisScores = calcAxisScores(answers)
  const typeCode = determineType(axisScores)
  const variantStats = calcVariantStats(typeCode, axisScores)
  const badgeCandidates = collectBadges(answers)

  return { typeCode, axisScores, variantStats, badgeCandidates }
}

// ────────────────────────────────────────────
// 3. 축별 점수 집계
// ────────────────────────────────────────────

function calcAxisScores(answers: TestAnswer[]): AxisScores {
  const scores: AxisScores = {
    FT: { F: 0, T: 0 },
    IC: { I: 0, C: 0 },
    EG: { E: 0, G: 0 },
    RW: { R: 0, W: 0 },
  }

  for (const answer of answers) {
    const q = QUESTIONS.find((q) => q.id === answer.questionId)
    if (!q) continue
    const v = answer.value
    switch (q.axis) {
      case 'FT':
        if (v === 'F') scores.FT.F++
        if (v === 'T') scores.FT.T++
        break
      case 'IC':
        if (v === 'I') scores.IC.I++
        if (v === 'C') scores.IC.C++
        break
      case 'EG':
        if (v === 'E') scores.EG.E++
        if (v === 'G') scores.EG.G++
        break
      case 'RW':
        if (v === 'R') scores.RW.R++
        if (v === 'W') scores.RW.W++
        break
    }
  }

  return scores
}

// ────────────────────────────────────────────
// 4. 유형 결정 (다수결)
// ────────────────────────────────────────────

function determineType(scores: AxisScores): TypeCode {
  const f1 = scores.FT.F >= scores.FT.T ? 'F' : 'T'
  const f2 = scores.IC.I >= scores.IC.C ? 'I' : 'C'
  const f3 = scores.EG.E >= scores.EG.G ? 'E' : 'G'
  const f4 = scores.RW.R >= scores.RW.W ? 'R' : 'W'
  return (f1 + f2 + f3 + f4) as TypeCode
}

// ────────────────────────────────────────────
// 5. 변동 스탯 계산 (축 비율 공식)
//
// 공식: variantStat = baseStat + Σ(축 편중 가중치)
//
// 편중 가중치:
//   3:0 (완전 한쪽) → ±6
//   2:1 (약간 한쪽) → ±3
//   0:0 or tie      → 0
//
// 각 스탯에 영향을 주는 축:
//   몰입력: IC(I+), FT(F+)
//   인내심: IC(C+), EG(G+)
//   감수성: FT(F+), EG(E+)
//   허세력: RW(W+), TT(T+)
//   완독력: EG(G+), IC(I+)
//
// 최종값은 10~99 범위로 클램핑
// ────────────────────────────────────────────

const STAT_AXIS_MAP: Record<StatKey, { axis: keyof AxisScores; positive: string }[]> = {
  몰입력: [
    { axis: 'IC', positive: 'I' },
    { axis: 'FT', positive: 'F' },
  ],
  인내심: [
    { axis: 'IC', positive: 'C' },
    { axis: 'EG', positive: 'G' },
  ],
  감수성: [
    { axis: 'FT', positive: 'F' },
    { axis: 'EG', positive: 'E' },
  ],
  허세력: [
    { axis: 'RW', positive: 'W' },
    { axis: 'FT', positive: 'T' },
  ],
  완독력: [
    { axis: 'EG', positive: 'G' },
    { axis: 'IC', positive: 'I' },
  ],
}

function axisWeight(
  scores: AxisScores,
  axis: keyof AxisScores,
  positive: string,
): number {
  const pair = scores[axis] as Record<string, number>
  const keys = Object.keys(pair)
  const posVal = pair[positive] ?? 0
  const negVal = pair[keys.find((k) => k !== positive)!] ?? 0
  const diff = posVal - negVal // -3 ~ +3 (축당 문항 3개)
  // diff: +3 → +6, +1 → +3, 0 → 0, -1 → -3, -3 → -6
  if (diff >= 3) return 6
  if (diff >= 1) return 3
  if (diff <= -3) return -6
  if (diff <= -1) return -3
  return 0
}

function calcVariantStats(
  typeCode: TypeCode,
  axisScores: AxisScores,
): Record<StatKey, number> {
  const base = READING_TYPES[typeCode].baseStats
  const result = {} as Record<StatKey, number>

  for (const [stat, axes] of Object.entries(STAT_AXIS_MAP) as [StatKey, typeof STAT_AXIS_MAP[StatKey]][]) {
    const delta = axes.reduce(
      (sum, { axis, positive }) => sum + axisWeight(axisScores, axis, positive),
      0,
    )
    result[stat] = Math.min(99, Math.max(10, base[stat] + delta))
  }

  return result
}

// ────────────────────────────────────────────
// 6. 배지 후보 수집
// ────────────────────────────────────────────

function collectBadges(answers: TestAnswer[]): string[] {
  return answers.filter((a) => !!a.badgeKey).map((a) => a.badgeKey!)
}

// ────────────────────────────────────────────
// 7. 유틸: 스탯 막대 퍼센트 → 블록 수 (최대 10칸)
// ────────────────────────────────────────────

export function statToBlocks(value: number): number {
  return Math.round((value / 100) * 10)
}

// ────────────────────────────────────────────
// 8. localStorage 저장/불러오기 (Phase 1 임시)
// ────────────────────────────────────────────

const STORAGE_KEY = 'book_test_result'

export function saveResult(result: TestResult): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  recordActivity('test')
}

export function loadResult(): TestResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TestResult) : null
  } catch {
    return null
  }
}

export function clearResult(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
