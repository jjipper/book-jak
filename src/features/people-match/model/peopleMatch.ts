// Phase 3 — 취향 맞는 사람 계산 (허브 미리보기·people 목록 공용)
// 사람 데이터는 Supabase profiles, 궁합은 profiles.type_code 기반.

import { loadPeople } from '@/entities/person/api/personRemote'
import type { Person } from '@/entities/person/model/people'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import { calcAffinity } from '@/entities/reading-type/model/affinity'

export interface MatchedPerson {
  person: Person
  affinity: number
  sharedTags: string[]
}

/** 내 유형이 없으면 빈 배열(테스트 유도), 다른 가입자가 없어도 빈 배열(빈 상태). */
export async function getMatchedPeople(): Promise<MatchedPerson[]> {
  const myTypeCode = loadResult()?.typeCode
  if (!myTypeCode) return []
  const myTags = new Set(loadBlindRatings().flatMap((r) => r.tags))
  const people = await loadPeople()
  return people
    .filter((p) => p.typeCode)
    .map((person) => ({
      person,
      affinity: calcAffinity(myTypeCode, person.typeCode!),
      sharedTags: person.favoriteTags.filter((t) => myTags.has(t)),
    }))
    .sort((a, b) => b.affinity - a.affinity)
}

export interface PersonInsight {
  affinity: number | null
  sharedTags: string[]
}

// 마이 · 소셜 어디서 프로필을 봐도 "나와 이 사람" 궁합 데이터를 동일하게 계산
export function getPersonInsight(person: Person): PersonInsight {
  const myTypeCode = loadResult()?.typeCode
  const myTags = new Set(loadBlindRatings().flatMap((r) => r.tags))

  return {
    affinity: myTypeCode && person.typeCode ? calcAffinity(myTypeCode, person.typeCode) : null,
    sharedTags: person.favoriteTags.filter((t) => myTags.has(t)),
  }
}
