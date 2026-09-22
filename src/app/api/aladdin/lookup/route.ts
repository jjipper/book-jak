// 알라딘 ItemLookUp API 프록시 — ISBN13 한 권 상세 (책 상세 화면)
// ?isbn13=9788936434120 → { books: [책] } (없으면 빈 배열)

import { aladdinResponse } from '../aladdinApi'

export async function GET(request: Request) {
  const isbn13 = new URL(request.url).searchParams.get('isbn13')?.trim()
  if (!isbn13 || !/^\d{13}$/.test(isbn13)) return Response.json({ books: [] })

  return aladdinResponse('ItemLookUp', {
    ItemId: isbn13,
    ItemIdType: 'ISBN13',
    // 쪽수·부제는 subInfo 기본값으로 온다. Toc/Story/authors/fulldescription은 요청해도 비어 온다(키 권한).
  })
}
