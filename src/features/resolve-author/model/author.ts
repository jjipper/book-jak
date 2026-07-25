// 소셜 전반(토론·모임)에서 authorId('me' 또는 MOCK_PEOPLE id)를 화면에 보여줄
// 닉네임/유형 정보로 풀어내는 공용 헬퍼

import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { getNickname } from '@/entities/user/model/profile'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { ME_ID } from '@/shared/config/currentUser'

export { ME_ID }

export interface ResolvedAuthor {
  nickname: string
  typeCode: TypeCode | null
}

export function resolveAuthor(authorId: string): ResolvedAuthor {
  if (authorId === ME_ID) {
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
