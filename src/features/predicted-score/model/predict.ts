// 평가 탭 — 내 평가 이력 기반 예상 점수
// 블라인드 카드 평가(blindRatings)와 책 평가(bookRatings)에서 태그별 평균 별점을 구하고,
// 대상 책의 태그와 매칭해 개인화 점수를 낸 뒤 전체 평균 별점과 블렌딩한다.
// 콘텐츠 기반 추천의 아주 단순한 버전 — 실서비스에서는 서버 모델로 대체.

import { loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import { loadBookRatings } from '@/entities/book-rating/model/bookRatings'
import { getBook, type Book } from '@/entities/book/model/books'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'

export interface PredictedScore {
  score: number // 0.5 단위 아님, 소수 첫째 자리 반올림 (예: 4.2)
  matchedTags: string[] // 예상에 실제로 쓰인 태그
  sampleCount: number // 근거가 된 내 평가 개수
}

const PERSONAL_WEIGHT = 0.7 // 내 태그 취향 비중 (나머지는 책 평균 별점)

// 내 평가 이력을 태그별 평균 별점 통계로 변환 (excludeBookId는 근거에서 제외)
function buildTagStats(excludeBookId?: string) {
  const history: { tags: string[]; stars: number }[] = []

  for (const r of loadBlindRatings()) {
    if (r.stars > 0) history.push({ tags: r.tags, stars: r.stars })
  }
  for (const r of loadBookRatings()) {
    if (excludeBookId && r.bookId === excludeBookId) continue
    const rated = getBook(r.bookId)
    if (rated) history.push({ tags: rated.tags, stars: r.stars })
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

export function predictScore(book: Book): PredictedScore | null {
  const { tagStats, sampleCount } = buildTagStats(book.id)
  if (sampleCount === 0) return null

  const matchedTags = book.tags.filter((t) => tagStats.has(t))
  if (matchedTags.length === 0) return null

  const personal =
    matchedTags.reduce((acc, t) => {
      const s = tagStats.get(t)!
      return acc + s.sum / s.n
    }, 0) / matchedTags.length

  const blended = PERSONAL_WEIGHT * personal + (1 - PERSONAL_WEIGHT) * book.avgRating
  const score = Math.min(5, Math.max(0.5, Math.round(blended * 10) / 10))

  return { score, matchedTags, sampleCount }
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
