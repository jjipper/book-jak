import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { getNickname, getMyId } from '@/entities/user/model/profile'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'

export const ME_ID = 'me'

export interface ResolvedAuthor {
  nickname: string
  typeCode: TypeCode | null
}

export function resolveAuthor(authorId: string): ResolvedAuthor {
  const myId = getMyId()
  if (authorId === ME_ID || (myId !== ME_ID && authorId === myId)) {
    return {
      nickname: getNickname() ?? '나',
      typeCode: loadResult()?.typeCode ?? null,
    }
  }
  const person = MOCK_PEOPLE.find((p) => p.id === authorId)
  return person
    ? { nickname: person.nickname, typeCode: person.typeCode }
    : { nickname: '알 수 없음', typeCode: null }
}
