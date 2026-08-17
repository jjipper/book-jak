// 알라딘 ItemList API 프록시 — TTBKey를 서버에 숨기고 정규화된 책 목록 반환
// ?categoryId=1&queryType=Bestseller&start=1&maxResults=10
//
// TODO: ALADDIN_TTB_KEY 발급 후 .env.local에 추가
//   발급처: https://www.aladin.co.kr/ttb/wapui/wapi_guide.aspx
//   키 이름: ALADDIN_TTB_KEY

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
  const categoryId = searchParams.get('categoryId') ?? '0'
  const queryType = searchParams.get('queryType') ?? 'Bestseller'
  const start = searchParams.get('start') ?? '1'
  const maxResults = searchParams.get('maxResults') ?? '10'

  const key = process.env.ALADDIN_TTB_KEY
  if (!key) {
    return Response.json(
      { error: 'ALADDIN_TTB_KEY가 설정되지 않았어요 (.env.local 확인)' },
      { status: 500 },
    )
  }

  const params = new URLSearchParams({
    TTBKey: key,
    QueryType: queryType,
    CategoryId: categoryId,
    MaxResults: maxResults,
    Start: start,
    SearchTarget: 'Book',
    Cover: 'Big',
    Output: 'JS',
    Version: '20131101',
  })

  let res: Response
  try {
    res = await fetch(`https://www.aladin.co.kr/ttb/api/ItemList.aspx?${params}`)
  } catch {
    return Response.json({ error: '알라딘 API 연결 실패' }, { status: 502 })
  }

  if (!res.ok) {
    return Response.json({ error: `알라딘 API 오류 (${res.status})` }, { status: 502 })
  }

  const text = await res.text()
  let data: { item?: AladdinRawItem[]; errorCode?: number }
  try {
    data = JSON.parse(text)
  } catch {
    return Response.json({ error: '알라딘 응답 파싱 실패' }, { status: 502 })
  }

  if (data.errorCode) {
    return Response.json({ error: `알라딘 오류 코드: ${data.errorCode}` }, { status: 502 })
  }

  const books = (data.item ?? [])
    .filter((i) => i.isbn13)
    .map(normalize)

  return Response.json({ books })
}
