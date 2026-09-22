// 알라딘 ItemSearch API 프록시 — 키워드로 책을 찾는다 (평가 탭 검색, 글쓰기 책 첨부)
// ?q=검색어&maxResults=10
// 목록형(베스트셀러 등)은 /api/aladdin/list — 정규화 결과 타입은 동일하다.

import { aladdinResponse } from '../aladdinApi'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return Response.json({ books: [] })

  return aladdinResponse('ItemSearch', {
    Query: q,
    QueryType: 'Keyword',
    MaxResults: searchParams.get('maxResults') ?? '10',
    Start: '1',
    SearchTarget: 'Book',
  })
}
