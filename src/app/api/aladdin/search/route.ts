// 알라딘 ItemSearch API 프록시 — 키워드로 책을 찾는다 (글쓰기 책 첨부용)
// ?q=검색어&maxResults=10
// 목록형(베스트셀러 등)은 /api/aladdin/list — 정규화 결과 타입은 동일하다.

import type { AladdinBook } from '@/entities/external-book/model/aladdinBooks'

interface AladdinRawItem {
  title: string
  author: string
  cover: string
  isbn13: string
  description: string
  categoryName: string
  publisher: string
  pubDate: string
}

function normalize(item: AladdinRawItem): AladdinBook {
  return {
    id: `isbn-${item.isbn13}`,
    isbn13: item.isbn13,
    title: item.title,
    author: item.author,
    cover: item.cover,
    description: item.description,
    categoryName: item.categoryName,
    publisher: item.publisher,
    pubDate: item.pubDate,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  const maxResults = searchParams.get('maxResults') ?? '10'

  if (!q) return Response.json({ books: [] })

  const key = process.env.ALADDIN_TTB_KEY
  if (!key) {
    return Response.json(
      { error: 'ALADDIN_TTB_KEY가 설정되지 않았어요 (.env.local 확인)' },
      { status: 500 },
    )
  }

  const params = new URLSearchParams({
    TTBKey: key,
    Query: q,
    QueryType: 'Keyword',
    MaxResults: maxResults,
    Start: '1',
    SearchTarget: 'Book',
    Cover: 'Big',
    Output: 'JS',
    Version: '20131101',
  })

  let res: Response
  try {
    res = await fetch(`https://www.aladin.co.kr/ttb/api/ItemSearch.aspx?${params}`)
  } catch {
    return Response.json({ error: '알라딘 API 연결 실패' }, { status: 502 })
  }

  if (!res.ok) {
    return Response.json({ error: `알라딘 API 오류 (${res.status})` }, { status: 502 })
  }

  let data: { item?: AladdinRawItem[]; errorCode?: number }
  try {
    data = JSON.parse(await res.text())
  } catch {
    return Response.json({ error: '알라딘 응답 파싱 실패' }, { status: 502 })
  }

  if (data.errorCode) {
    return Response.json({ error: `알라딘 오류 코드: ${data.errorCode}` }, { status: 502 })
  }

  // ISBN13이 없는 항목(전자책 일부)은 bookId를 만들 수 없어 제외한다
  const books = (data.item ?? []).filter((i) => i.isbn13).map(normalize)
  return Response.json({ books })
}
