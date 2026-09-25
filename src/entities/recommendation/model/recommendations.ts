// 책 추천 — 데이터는 Supabase rec_requests / recommendations / rec_reads / rec_saves가 유일한 소스 (0016, 0019).

export type RecSort = 'latest' | 'popular'

/**
 * 추천 목록의 두 종류 (DB rec_requests.kind).
 *   ask   — 추천 받고 싶어요: 다른 사람들이 책을 채운다 (작성자는 못 채운다)
 *   share — 내가 추천해요  : 작성자 본인만 책을 담는다
 * 둘 다 트리거 tg_guard_recommendation이 강제한다.
 */
export type RecKind = 'ask' | 'share'

/** 한 목록에 섞여 나오므로 라벨은 첫 글자부터 갈라지는 명사로 둔다 */
export const REC_KIND_LABEL: Record<RecKind, string> = {
  ask: '추천 요청',
  share: '추천 목록',
}

/** 목록 필터 — 'all'은 두 종류를 함께 본다 */
export type RecFilter = RecKind | 'all'

export const REC_FILTER_LABEL: Record<RecFilter, string> = {
  all: '전체',
  ask: '추천받기',
  share: '추천하기',
}

/** 한 요청에 한 사람이 추천할 수 있는 최대 권수 — DB 트리거(tg_guard_recommendation)와 같은 값 */
export const REC_LIMIT_PER_USER = 10

export interface RecRequest {
  id: string
  kind: RecKind
  authorId: string
  authorNickname: string
  /** 작성 시점 BOOKBTI 스냅샷 */
  typeCode: string | null
  /** 목록 제목 — 목록·상세의 주인공 */
  title: string
  /** 분위기 설명 (선택) */
  mood: string | null
  isOpen: boolean
  recCount: number
  readerCount: number
  savedCount: number
  ts: number
}

export interface RecRead {
  userId: string
  nickname: string
  rating: number | null
  review: string | null
}

export interface Recommendation {
  id: string
  authorId: string
  authorNickname: string
  authorTypeCode: string | null
  bookTitle: string
  bookIsbn: string | null
  bookCover: string | null
  reason: string
  reads: RecRead[]
  /** 서재에 담은 사람들 (rec_saves) — 담은 수 집계와 내 담김 여부 */
  savedBy: string[]
  ts: number
}
