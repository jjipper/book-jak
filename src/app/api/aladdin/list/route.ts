// 알라딘 ItemList API 프록시 — 정규화된 책 목록 반환
// ?categoryId=1&queryType=Bestseller&start=1&maxResults=10

import { aladdinResponse } from '../aladdinApi'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  return aladdinResponse('ItemList', {
    QueryType: searchParams.get('queryType') ?? 'Bestseller',
    CategoryId: searchParams.get('categoryId') ?? '0',
    MaxResults: searchParams.get('maxResults') ?? '10',
    Start: searchParams.get('start') ?? '1',
    SearchTarget: 'Book',
  })
}
