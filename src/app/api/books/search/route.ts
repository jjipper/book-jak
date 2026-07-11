// 카카오 책 검색 프록시 — REST 키를 서버에 숨기고 앱에서 쓰기 좋은 형태로 정규화
// ?q=검색어        : 제목·저자 통합 검색
// ?isbn=ISBN13    : ISBN 단건 조회 (상세 페이지용)

import type { ExternalBook } from '@/lib/externalBooks'

interface KakaoBookDocument {
  title: string
  contents: string
  url: string
  isbn: string // "ISBN10 ISBN13" 공백 구분
  datetime: string
  authors: string[]
  translators: string[]
  publisher: string
  price: number
  thumbnail: string
  status: string
}

function normalize(doc: KakaoBookDocument): ExternalBook {
  const isbn13 = doc.isbn.split(' ').pop() ?? doc.isbn
  return {
    id: `isbn-${isbn13}`,
    isbn: isbn13,
    title: doc.title,
    authors: doc.authors,
    publisher: doc.publisher,
    year: doc.datetime ? new Date(doc.datetime).getFullYear() : null,
    thumbnail: doc.thumbnail,
    description: doc.contents,
    url: doc.url,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const isbn = searchParams.get('isbn')?.trim()

  if (!q && !isbn) return Response.json({ books: [] })

  const key = process.env.KAKAO_REST_KEY
  if (!key) {
    return Response.json({ error: 'KAKAO_REST_KEY가 설정되지 않았어요 (.env.local 확인)' }, { status: 500 })
  }

  const params = new URLSearchParams(
    isbn ? { query: isbn, target: 'isbn', size: '1' } : { query: q!, size: '15' },
  )
  const res = await fetch(`https://dapi.kakao.com/v3/search/book?${params}`, {
    headers: { Authorization: `KakaoAK ${key}` },
  })
  if (!res.ok) {
    return Response.json({ error: `카카오 API 오류 (${res.status})` }, { status: 502 })
  }

  const data = (await res.json()) as { documents: KakaoBookDocument[] }
  return Response.json({ books: data.documents.map(normalize) })
}
