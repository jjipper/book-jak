import { describe, expect, it } from 'vitest'
import { QUESTIONS, type AxisValue } from './questions'
import { READING_TYPES, type TypeCode } from './readingTypes'
import { scoreTest, type TestAnswer } from './scoring'
import { calcAffinity } from './affinity'
import { BADGE_LIST, evaluateBadges, type BadgeStats } from './badges'

// 축마다 고른 쪽 값으로 12문항 전부 답한다
function answerAll(pick: Record<string, AxisValue>): TestAnswer[] {
  return QUESTIONS.map((q) => {
    const opt = q.options.find((o) => o.value === pick[q.axis])!
    return { questionId: q.id, selectedOptionId: opt.id, value: opt.value, badgeKey: opt.badgeKey }
  })
}

describe('scoreTest', () => {
  it('축별 다수결로 유형 코드를 정한다', () => {
    expect(scoreTest(answerAll({ FT: 'F', IC: 'I', EG: 'E', RW: 'R' })).typeCode).toBe('FIER')
    expect(scoreTest(answerAll({ FT: 'T', IC: 'C', EG: 'G', RW: 'W' })).typeCode).toBe('TCGW')
  })

  it('동점이면 앞쪽 값(F·I·E·R)으로 정한다', () => {
    expect(scoreTest([]).typeCode).toBe('FIER')
  })

  it('스탯은 기본값에 축 편중을 더하고 10~99로 자른다', () => {
    const { typeCode, variantStats } = scoreTest(answerAll({ FT: 'F', IC: 'I', EG: 'E', RW: 'R' }))
    const base = READING_TYPES[typeCode].baseStats
    // 몰입력: I 3:0(+6), F 3:0(+6)
    expect(variantStats.몰입력).toBe(Math.min(99, base.몰입력 + 12))
    for (const v of Object.values(variantStats)) expect(v).toBeGreaterThanOrEqual(10)
    for (const v of Object.values(variantStats)) expect(v).toBeLessThanOrEqual(99)
  })

  it('16유형 모두 결과 데이터가 있다', () => {
    const codes = ['F', 'T'].flatMap((a) => ['I', 'C'].flatMap((b) => ['E', 'G'].flatMap((c) => ['R', 'W'].map((d) => a + b + c + d))))
    for (const code of codes) expect(READING_TYPES[code as TypeCode]).toBeDefined()
  })
})

describe('calcAffinity', () => {
  it('지정 궁합·상극은 고정 점수, 나머지는 같은 글자 수로 계산한다', () => {
    const fier = READING_TYPES.FIER.compatibility
    expect(calcAffinity('FIER', fier.match)).toBe(97)
    expect(calcAffinity('FIER', fier.opposite)).toBe(18)
    expect(calcAffinity('FIER', 'FIEW')).toBe(40 + 3 * 15)
  })

  it('16×16 모든 조합이 0~100 안에 있다', () => {
    const codes = Object.keys(READING_TYPES) as TypeCode[]
    for (const a of codes) for (const b of codes) {
      const n = calcAffinity(a, b)
      expect(n).toBeGreaterThanOrEqual(0)
      expect(n).toBeLessThanOrEqual(100)
    }
  })
})

describe('badges', () => {
  const empty: BadgeStats = {
    answerBadges: [], hasTestResult: false, typeRarityPct: null, ratedCount: 0, reviewCount: 0,
    avgStars: 0, genreCount: 0, topGenreShare: 0, blindRevealed: 0, blindSaved: 0, blindPassed: 0,
    wishCount: 0, recCount: 0, postCount: 0, commentCount: 0, clubCount: 0, followerCount: 0,
    followingCount: 0, attendanceStreak: 0, favoriteBookCount: 0,
  }

  it('배지 키가 겹치지 않는다 (키가 곧 이미지 파일명)', () => {
    const keys = BADGE_LIST.map((b) => b.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('활동이 없으면 아무것도 획득하지 않는다', () => {
    expect(evaluateBadges(empty).filter((b) => b.unlocked)).toEqual([])
  })

  it('획득한 배지가 먼저, 그 안에서 등급 높은 순으로 정렬한다', () => {
    const list = evaluateBadges({ ...empty, ratedCount: 100, followerCount: 50, attendanceStreak: 7 })
    const unlocked = list.filter((b) => b.unlocked)
    expect(unlocked.length).toBeGreaterThan(0)
    expect(list.slice(0, unlocked.length).every((b) => b.unlocked)).toBe(true)
    const order = { legendary: 0, rare: 1, common: 2 }
    const tiers = unlocked.map((b) => order[b.badge.tier])
    expect(tiers).toEqual([...tiers].sort((a, b) => a - b))
  })
})
