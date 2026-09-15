// 알라딘 Open API 책 타입 + 클라이언트 fetch 헬퍼
// 서버 프록시(/api/aladdin/list)를 통해서만 호출 — TTBKey는 클라이언트에 노출되지 않는다.

export interface AladdinBook {
  id: string // 'isbn-{isbn13}'
  isbn13: string
  title: string
  author: string
  cover: string
  description: string
  categoryName: string
  publisher: string
  pubDate: string
}

export const ALADDIN_CATEGORIES = [
  { id: '0', name: '전체' },
  { id: '1', name: '소설' },
  { id: '55889', name: '에세이' },
  { id: '336', name: '자기계발' },
  { id: '656', name: '인문학' },
  { id: '987', name: '과학' },
  { id: '74', name: '역사' },
  { id: '50930', name: 'SF' },
] as const

export type AladdinCategoryId = typeof ALADDIN_CATEGORIES[number]['id']

// Fisher-Yates 셔플 (유사 랜덤용)
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function fetchAladdinBooks(params: {
  categoryId?: string
  queryType?: string
  start?: number
  maxResults?: number
}): Promise<AladdinBook[]> {
  const sp = new URLSearchParams({
    categoryId: params.categoryId ?? '0',
    queryType: params.queryType ?? 'Bestseller',
    start: String(params.start ?? 1),
    maxResults: String(params.maxResults ?? 10),
  })
  const res = await fetch(`/api/aladdin/list?${sp}`)
  const data = (await res.json()) as { books?: AladdinBook[]; error?: string }
  if (!res.ok || data.error) throw new Error(data.error ?? `알라딘 API 요청 실패 (${res.status})`)
  return data.books ?? []
}

/** 키워드 검색 (글쓰기 책 첨부용) */
export async function searchAladdinBooks(q: string, maxResults = 10): Promise<AladdinBook[]> {
  const sp = new URLSearchParams({ q, maxResults: String(maxResults) })
  const res = await fetch(`/api/aladdin/search?${sp}`)
  const data = (await res.json()) as { books?: AladdinBook[]; error?: string }
  if (!res.ok || data.error) throw new Error(data.error ?? `알라딘 API 요청 실패 (${res.status})`)
  return data.books ?? []
}

/** ISBN13 → 책 상세 경로. /rate/books/[id]가 'isbn-' 접두 id를 받는다 */
export function bookDetailHref(isbn13: string): string {
  return `/rate/books/isbn-${isbn13}`
}
