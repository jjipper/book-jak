// Phase 3 — 취향 맞는 사람 계산 (허브 미리보기·people 목록 공용)

import { MOCK_PEOPLE, type MockPerson } from '@/entities/person/model/people'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import { calcAffinity } from '@/entities/reading-type/model/affinity'

export interface MatchedPerson {
  person: MockPerson
  affinity: number
  sharedTags: string[]
}

export function getMatchedPeople(): MatchedPerson[] {
  const myTypeCode = loadResult()?.typeCode
  if (!myTypeCode) return []
  const myTags = new Set(loadBlindRatings().flatMap((r) => r.tags))
  return MOCK_PEOPLE
    .map((person) => ({
      person,
      affinity: calcAffinity(myTypeCode, person.typeCode),
      sharedTags: person.favoriteTags.filter((t) => myTags.has(t)),
    }))
    .sort((a, b) => b.affinity - a.affinity)
}

export interface PersonInsight {
  affinity: number | null
  sharedTags: string[]
  sharedBooks: { id: number; title: string; author: string }[]
}

// 마이 · 소셜 어디서 프로필을 봐도 "나와 이 사람" 궁합 데이터를 동일하게 계산
export function getPersonInsight(person: MockPerson): PersonInsight {
  const myTypeCode = loadResult()?.typeCode
  const myRatings = loadBlindRatings()
  const myTags = new Set(myRatings.flatMap((r) => r.tags))
  const myLikedBookIds = new Set(myRatings.filter((r) => r.stars >= 4).map((r) => r.bookId))

  return {
    affinity: myTypeCode ? calcAffinity(myTypeCode, person.typeCode) : null,
    sharedTags: person.favoriteTags.filter((t) => myTags.has(t)),
    sharedBooks: BLIND_BOOKS
      .filter((b) => person.favoriteBookIds.includes(b.id) && myLikedBookIds.has(b.id))
      .map((b) => ({ id: b.id, title: b.title, author: b.author })),
  }
}
