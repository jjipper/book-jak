// 책 추천 — 데이터는 Supabase rec_requests / recommendations / rec_reads가 유일한 소스 (0016).

export type RecSort = 'latest' | 'popular'

/** 한 요청에 한 사람이 추천할 수 있는 최대 권수 — DB 트리거(tg_guard_recommendation)와 같은 값 */
export const REC_LIMIT_PER_USER = 10

export interface RecRequest {
  id: string
  authorId: string
  authorNickname: string
  /** 작성 시점 BOOKBTI 스냅샷 */
  typeCode: string | null
  /** 플레이리스트 제목 — 목록·상세의 주인공 */
  title: string
  /** 분위기 설명 (선택) */
  mood: string | null
  bookTitle: string | null
  bookIsbn: string | null
  bookCover: string | null
  isOpen: boolean
  recCount: number
  readerCount: number
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
  ts: number
}
