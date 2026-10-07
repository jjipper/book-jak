import { describe, expect, it } from 'vitest'
import { BOOKS_PER_DAY, kstDateKey, makeBlurb, pickDailyBlindBooks, seededShuffle, type AladdinItem } from './blindBooks'

const DESC = '한 남자가 사라진 동생을 찾아 낯선 도시를 헤맨다. 그가 마주한 것은 오래 묻어둔 가족의 비밀이었다.'

function item(n: number, over: Partial<AladdinItem> = {}): AladdinItem {
  return {
    isbn13: `97900000000${String(n).padStart(2, '0')}`,
    title: `책 ${n}`,
    author: '홍길동 (지은이)',
    description: `${n}번째 이야기. ${DESC}`,
    categoryName: '국내도서>소설/시/희곡>한국소설',
    pubDate: '2024-03-01',
    publisher: '출판사',
    cover: '',
    ...over,
  } as AladdinItem
}

describe('makeBlurb — 정답을 가린다', () => {
  it('소개에 본제목이 그대로 있으면 쓰지 않는다', () => {
    expect(makeBlurb(`소설 모순은 ${DESC}`, '모순 - 개정판', '양귀자')).toBeNull()
  })

  it('저자명과 꺾쇠 안의 작품명을 가린다', () => {
    const out = makeBlurb(`양귀자가 『원미동 사람들』 이후 쓴 이야기. ${DESC}`, '다른 제목', '양귀자 (지은이)')!
    expect(out).not.toContain('양귀자')
    expect(out).not.toContain('원미동')
    expect(out).toContain('○○○')
  })

  it('정보가 없는 짧은 소개는 쓰지 않는다', () => {
    expect(makeBlurb('양귀자의 장편소설.', '모순', '양귀자')).toBeNull()
  })

  it('HTML 엔티티와 태그를 풀어낸다', () => {
    expect(makeBlurb(`<b>낯선</b> 도시 &amp; 사라진 동생. ${DESC}`, '제목', '저자')).toMatch(/^낯선 도시 & 사라진/)
  })
})

describe('오늘의 블라인드 북', () => {
  const items = Array.from({ length: 20 }, (_, i) => item(i))

  it('같은 날짜면 누구에게나 같은 5권, 날짜가 바뀌면 순서가 바뀐다', () => {
    const a = pickDailyBlindBooks(items, '2026-10-07').map((b) => b.book.isbn13)
    expect(a).toHaveLength(BOOKS_PER_DAY)
    expect(pickDailyBlindBooks(items, '2026-10-07').map((b) => b.book.isbn13)).toEqual(a)
    expect(pickDailyBlindBooks(items, '2026-10-08').map((b) => b.book.isbn13)).not.toEqual(a)
  })

  it('세트 상품과 같은 ISBN 중복은 건너뛴다', () => {
    const picked = pickDailyBlindBooks([item(1), item(1), item(2, { title: '해리 포터 세트' })], '2026-10-07')
    expect(picked.map((b) => b.book.isbn13)).toEqual([item(1).isbn13])
  })

  it('seededShuffle은 원본을 건드리지 않고 같은 키에 같은 결과를 낸다', () => {
    const arr = [1, 2, 3, 4, 5, 6]
    expect(seededShuffle(arr, 'k')).toEqual(seededShuffle(arr, 'k'))
    expect(arr).toEqual([1, 2, 3, 4, 5, 6])
    expect([...seededShuffle(arr, 'k')].sort()).toEqual(arr)
  })

  it('날짜 키는 KST 기준 — UTC 15시가 한국 자정', () => {
    expect(kstDateKey(Date.UTC(2026, 9, 7, 14, 59))).toBe('2026-10-07')
    expect(kstDateKey(Date.UTC(2026, 9, 7, 15, 0))).toBe('2026-10-08')
  })
})
