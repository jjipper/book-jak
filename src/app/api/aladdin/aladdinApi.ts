// 알라딘 TTB API 공통 호출 — list/search/lookup 라우트가 같이 쓴다. TTBKey는 서버에만 있다.
// 결과는 AladdinBook[]로 정규화해 { books }로 돌려준다.

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
  // ItemLookUp에서만 온다. TOC·저자소개·출판사서평 OptResult는 이 TTB 키로는 응답에 빠진다.
  subInfo?: { subTitle?: string; itemPage?: number }
}

// 알라딘은 제목·소개에 &lt; &amp; 같은 HTML 엔티티를 그대로 담아 보낸다
function decode(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
}

function normalize(item: AladdinRawItem): AladdinBook {
  return {
    id: `isbn-${item.isbn13}`,
    isbn13: item.isbn13,
    title: decode(item.title),
    author: decode(item.author),
    cover: item.cover,
    description: decode(item.description),
    categoryName: item.categoryName,
    publisher: decode(item.publisher),
    pubDate: item.pubDate,
    subTitle: item.subInfo?.subTitle ? decode(item.subInfo.subTitle) : undefined,
    itemPage: item.subInfo?.itemPage || undefined,
  }
}

export async function aladdinResponse(
  endpoint: 'ItemList' | 'ItemSearch' | 'ItemLookUp',
  params: Record<string, string>,
): Promise<Response> {
  const key = process.env.ALADDIN_TTB_KEY
  if (!key) {
    return Response.json(
      { error: 'ALADDIN_TTB_KEY가 설정되지 않았어요 (.env.local 확인)' },
      { status: 500 },
    )
  }

  const sp = new URLSearchParams({ TTBKey: key, Cover: 'Big', Output: 'JS', Version: '20131101', ...params })

  let res: Response
  try {
    // 알라딘 TTB는 일 5,000회 한도라 같은 요청은 서버에서 재사용한다.
    // 책 한 권 정보는 거의 안 바뀌고(하루), 목록·검색 결과는 몇 시간 늦어도 괜찮다.
    const revalidate = endpoint === 'ItemLookUp' ? 86400 : 3600
    res = await fetch(`https://www.aladin.co.kr/ttb/api/${endpoint}.aspx?${sp}`, { next: { revalidate } })
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

  // 8 = 해당 상품 없음 (lookup) — 에러가 아니라 빈 결과
  if (data.errorCode === 8) return Response.json({ books: [] })
  if (data.errorCode) {
    return Response.json({ error: `알라딘 오류 코드: ${data.errorCode}` }, { status: 502 })
  }

  // ISBN13이 없는 항목(전자책 일부)은 bookId를 만들 수 없어 제외한다
  const books = (data.item ?? []).filter((i) => i.isbn13).map(normalize)
  return Response.json({ books })
}
