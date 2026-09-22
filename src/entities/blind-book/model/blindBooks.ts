// 발견 탭 — 오늘의 블라인드 북. 알라딘 실제 책에서 날짜별로 모든 사용자에게 같은 5권을 고른다.
// 선정·가림 처리는 서버(app/api/blind/today)에서만 한다 — 공개 전 제목이 클라이언트로 내려가지 않게.
// 이 파일의 함수는 순수 함수라 서버 라우트에서 import 해서 쓴다.

export const BOOKS_PER_DAY = 5

/** 공개 후에만 내려가는 책 정보 */
export interface RevealedBook {
  isbn13: string
  title: string
  author: string
  publisher: string
  cover: string
  description: string
  categoryName: string
}

/** 카드에 보이는 가려진 책 */
export interface BlindBook {
  index: number
  blurb: string // 제목·저자를 가린 1~2문장
  tags: string[]
  illustCode: string
  status: 'new' | 'passed' | 'revealed'
  book?: RevealedBook // status === 'revealed'일 때만
}

/** 알라딘 ItemList 원본 항목 (필요한 필드만) */
export interface AladdinItem {
  isbn13: string
  title: string
  author: string
  publisher: string
  cover: string
  description: string
  categoryName: string
  pubDate: string
}

export interface DailyBlindBook {
  blurb: string
  tags: string[]
  illustCode: string
  book: RevealedBook
}

const MAX_BLURB = 120 // 이보다 길면 문장 단위로 자른다
const MAX_FIRST_SENTENCE = 130 // 첫 문장부터 이보다 길면 그 책은 건너뛴다
const MIN_BLURB = 30 // "○○○의 장편소설."처럼 정보가 없는 소개는 건너뛴다
// 일러스트가 있는 블라인드 표지만 (03·05는 파일 없음)
const ILLUSTS = ['01', '02', '04', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15']

// 알려진 HTML 태그만 지우고 엔티티를 푼다 — <작품명>처럼 꺾쇠로 쓴 제목까지 지우면 가림 검사를 빠져나간다
export function cleanText(s: string): string {
  return s
    .replace(/<\/?(br|b|p|i|em|strong|span|div|font|u)\b[^>]*>/gi, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

const squash = (s: string) => s.replace(/\s+/g, '')

// "밀란 쿤데라 (지은이), 홍한별 (옮긴이)" → ['밀란 쿤데라', '홍한별', '밀란', '쿤데라'] — 긴 것부터 가린다
function authorNames(author: string): string[] {
  const full = author
    .split(',')
    .map((a) => a.replace(/\(.*?\)/g, '').replace(/\s*외\s*\d*명?$/, '').trim())
  const parts = full.flatMap((a) => a.split(/\s+/))
  return [...new Set([...full, ...parts])].filter((a) => a.length >= 2).sort((a, b) => b.length - a.length)
}

/** "모순 - 개정판" / "로기완을 만났다 (리마스터판)" → 본제목 */
function mainTitle(title: string): string {
  return title.split(' - ')[0].replace(/\(.*?\)|\[.*?\]/g, '').trim()
}

/**
 * 알라딘 소개 → 제목·저자를 가린 1~2문장. 못 쓰는 책이면 null.
 * - 소개가 비었거나, 본제목(2자 이상)이 그대로 들어 있으면 건너뛴다
 * - 저자명은 ○○○, 『』《》「」〈〉<> 안의 다른 작품명은 ○○로 가린다
 * - 문장 단위로 MAX_BLURB자까지만. 첫 문장부터 너무 길면 건너뛴다
 */
export function makeBlurb(description: string, title: string, author: string): string | null {
  let text = cleanText(description)
  if (!text) return null
  const t = mainTitle(cleanText(title))
  if (t.length >= 2 && squash(text).includes(squash(t))) return null

  for (const name of authorNames(cleanText(author))) text = text.split(name).join('○○○')
  text = text.replace(/[『《「〈<][^』》」〉>]*[』》」〉>]/g, (m) => `${m[0]}○○${m[m.length - 1]}`)

  // 마침표 뒤 공백에서만 나눈다 — "1.5세" 같은 소수점에서 끊기지 않게
  const sentences = text.split(/(?<=[.!?。]["'”’]?)\s+/)
  if (sentences[0].length > MAX_FIRST_SENTENCE) return null
  let out = sentences[0]
  if (sentences[1] && out.length + 1 + sentences[1].length <= MAX_BLURB) out += ` ${sentences[1]}`
  return out.length >= MIN_BLURB ? out : null
}

/** "국내도서>소설/시/희곡>한국소설>2000년대 이후 한국소설" → 하위 카테고리 2개 + 출간 연도 */
export function makeTags(categoryName: string, pubDate: string): string[] {
  const cats = categoryName.split('>').slice(1).map((c) => c.trim()).filter(Boolean)
  const tags = [...new Set(cats)].slice(-2)
  const year = pubDate.slice(0, 4)
  if (/^\d{4}$/.test(year)) tags.push(`${year}년 출간`)
  return tags
}

function seedOf(key: string): number {
  let seed = 0
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) | 0
  return Math.abs(seed)
}

/** 같은 키면 항상 같은 순서 — 날짜별로 모든 사용자에게 같은 목록 */
export function seededShuffle<T>(arr: T[], key: string): T[] {
  let seed = seedOf(key)
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 알라딘 목록 → 오늘의 블라인드 북 (가림 처리 실패·세트·중복 소개는 건너뛴다) */
export function pickDailyBlindBooks(items: AladdinItem[], dateKey: string): DailyBlindBook[] {
  const seenIsbn = new Set<string>()
  const seenDesc = new Set<string>()
  const pool: DailyBlindBook[] = []
  for (const item of items) {
    if (!item.isbn13 || seenIsbn.has(item.isbn13)) continue
    if (/세트|전\s*\d+\s*권/.test(item.title)) continue
    const blurb = makeBlurb(item.description, item.title, item.author)
    if (!blurb || seenDesc.has(blurb)) continue
    seenIsbn.add(item.isbn13)
    seenDesc.add(blurb)
    pool.push({
      blurb,
      tags: makeTags(item.categoryName, item.pubDate),
      illustCode: `blind-${ILLUSTS[seedOf(item.isbn13) % ILLUSTS.length]}`,
      book: {
        isbn13: item.isbn13,
        title: cleanText(item.title),
        author: cleanText(item.author),
        publisher: item.publisher,
        cover: item.cover,
        description: cleanText(item.description),
        categoryName: item.categoryName,
      },
    })
  }
  return seededShuffle(pool, dateKey).slice(0, BOOKS_PER_DAY)
}

/** KST 기준 오늘 'YYYY-MM-DD' */
export function kstDateKey(now = Date.now()): string {
  return new Date(now + 9 * 3600_000).toISOString().slice(0, 10)
}

// 레거시 — 예전 15권 고정 블라인드 북 id. 옛 글(book_id 1~15)의 책 제목 표시에만 쓴다.
export const BLIND_BOOKS: { id: number; title: string }[] = [
  '나의 투쟁', '살인자의 기억법', '어떻게 살아야 할지 모르는 너에게', '군중 속의 고독',
  '열린 결말을 사랑한 사람들', '달러구트 꿈 백화점', '아몬드', '미드나잇 라이브러리', '파친코',
  '데미안', '죽고 싶지만 떡볶이는 먹고 싶어', '총, 균, 쇠', '불편한 편의점', '호밀밭의 파수꾼', '구의 증명',
].map((title, i) => ({ id: i + 1, title }))
