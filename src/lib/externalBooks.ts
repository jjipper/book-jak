// 카카오 책 검색 결과 타입 + 클라이언트 fetch 헬퍼
// 서버 프록시(/api/books/search)를 통해서만 호출 — REST 키는 클라이언트에 노출되지 않는다.

export interface ExternalBook {
  id: string // 'isbn-{ISBN13}' — bookRatings의 bookId로 그대로 사용
  isbn: string
  title: string
  authors: string[]
  publisher: string
  year: number | null
  thumbnail: string
  description: string
  url: string // 다음 책 상세 링크
}

export async function searchExternalBooks(q: string): Promise<ExternalBook[]> {
  const res = await fetch(`/api/books/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('검색 요청 실패')
  const data = (await res.json()) as { books: ExternalBook[] }
  return data.books
}

export async function lookupExternalBook(isbn: string): Promise<ExternalBook | null> {
  const res = await fetch(`/api/books/search?isbn=${encodeURIComponent(isbn)}`)
  if (!res.ok) throw new Error('조회 요청 실패')
  const data = (await res.json()) as { books: ExternalBook[] }
  return data.books[0] ?? null
}
