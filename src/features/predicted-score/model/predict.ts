// 발견 탭 — 내 블라인드 평가 이력 기반 예상 매칭도
// 블라인드 카드 평가(blindRatings)에서 태그별 평균 별점을 구하고,
// 대상 책의 태그와 매칭해 개인화 점수를 낸다.

import { loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'

// 내 평가 이력을 태그별 평균 별점 통계로 변환
// ponytail: 책 평가(ratings)는 알라딘 카테고리명만 알고 블라인드 태그 어휘와 겹치지 않아 근거에서 뺐다.
//           서버에 책별 취향 태그가 생기면 다시 합친다.
function buildTagStats() {
  const history: { tags: string[]; stars: number }[] = []

  for (const r of loadBlindRatings()) {
    if (r.stars > 0) history.push({ tags: r.tags, stars: r.stars })
  }

  const tagStats = new Map<string, { sum: number; n: number }>()
  for (const h of history) {
    for (const tag of h.tags) {
      const s = tagStats.get(tag) ?? { sum: 0, n: 0 }
      s.sum += h.stars
      s.n += 1
      tagStats.set(tag, s)
    }
  }
  return { tagStats, sampleCount: history.length }
}

export interface BlindMatch {
  percent: number // 0~100 예상 매칭도
  matchedTags: string[] // 근거가 된 취향 태그
  sampleCount: number
}

// 발견 탭 블라인드 카드용 — 내 취향 태그와 이 책의 태그가 얼마나 겹치고,
// 겹친 태그들을 내가 평균 몇 점을 줬는지로 매칭도(%)를 낸다.
export function predictBlindMatch(book: BlindBook): BlindMatch | null {
  const { tagStats, sampleCount } = buildTagStats()
  if (sampleCount === 0) return null

  const bookTags = book.tags.map((t) => t.text)
  const matchedTags = bookTags.filter((t) => tagStats.has(t))
  if (matchedTags.length === 0) return null

  const avgStars =
    matchedTags.reduce((acc, t) => {
      const s = tagStats.get(t)!
      return acc + s.sum / s.n
    }, 0) / matchedTags.length

  // 별점(1~5) → 매칭도(%). 태그가 많이 겹칠수록 소폭 가산.
  const base = (avgStars / 5) * 100
  const overlapBonus = Math.min(10, (matchedTags.length - 1) * 5)
  const percent = Math.min(99, Math.max(20, Math.round(base + overlapBonus)))

  return { percent, matchedTags, sampleCount }
}
