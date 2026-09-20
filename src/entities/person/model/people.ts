// 다른 사용자(profiles) 타입 + 화면 간 공유하는 표시용 캐시
// 데이터는 전부 Supabase profiles에서 온다 (api/personRemote.ts).

import type { TypeCode } from '@/entities/reading-type/model/readingTypes'

export interface Person {
  id: string
  nickname: string
  typeCode: TypeCode | null
  bio: string
  favoriteTags: string[]
  followingCount: number
  followerCount: number
}

/**
 * 작성자 id → 표시 정보 캐시.
 * 토론 글·답변처럼 목록 쿼리에서 이미 profiles를 조인해 온 경우,
 * 렌더 시점(동기)에 다시 조회하지 않기 위해 여기에 담아두고 꺼내 쓴다.
 * ponytail: 프로세스 메모리 캐시. 새로고침하면 비고, 목록을 먼저 불러온 화면에서만 채워진다.
 */
const displayCache = new Map<string, { nickname: string; typeCode: TypeCode | null }>()

export function cachePerson(id: string, nickname: string, typeCode: string | null): void {
  displayCache.set(id, { nickname, typeCode: (typeCode as TypeCode | null) ?? null })
}

export function getCachedPerson(id: string) {
  return displayCache.get(id)
}
