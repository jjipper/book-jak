import { getCachedPerson } from '@/entities/person/model/people'
import { getNickname, getMyId } from '@/entities/user/model/profile'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'

export const ME_ID = 'me'

export interface ResolvedAuthor {
  nickname: string
  typeCode: TypeCode | null
}

// 작성자 표시 정보는 목록 쿼리가 profiles를 조인해 와서 캐시에 넣어둔 값을 쓴다
// (entities/person/model/people.ts의 cachePerson).
export function resolveAuthor(authorId: string): ResolvedAuthor {
  const myId = getMyId()
  if (authorId === ME_ID || (myId !== ME_ID && authorId === myId)) {
    return {
      nickname: getNickname() ?? '나',
      typeCode: loadResult()?.typeCode ?? null,
    }
  }
  const cached = getCachedPerson(authorId)
  return cached
    ? { nickname: cached.nickname, typeCode: cached.typeCode }
    : { nickname: '알 수 없음', typeCode: null }
}
