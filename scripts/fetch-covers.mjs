// 카카오 책 검색 API로 목업 카탈로그의 실제 표지를 내려받아
// public/assets/illust/{code}.png 에 저장하는 스크립트 (macOS 전용 — sips 사용)
//
//   node scripts/fetch-covers.mjs
//
// .env.local의 KAKAO_REST_KEY를 사용한다. 검색 결과가 없는 가상의 책은
// 건너뛰며, 그 경우 IllustPlaceholder가 표지풍 플레이스홀더를 그려준다.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'public/assets/illust')
mkdirSync(OUT, { recursive: true })

const env = readFileSync(join(ROOT, '.env.local'), 'utf8')
const key = env.match(/KAKAO_REST_KEY=(.+)/)?.[1]?.trim()
if (!key) {
  console.error('KAKAO_REST_KEY 없음 (.env.local 확인)')
  process.exit(1)
}

// illustCode → 검색어 (제목 + 저자·출판사로 정확도 확보)
const TARGETS = [
  // 발견 탭 블라인드 책 (data/blindBooks.ts)
  ['blind-01', '나의 투쟁 1 크나우스고르'],
  ['blind-02', '살인자의 기억법 김영하'],
  ['blind-03', '어떻게 살아야 할지 모르는 너에게'], // 가상의 책 — 결과 없음
  ['blind-04', '고독한 군중 리스먼'], // 실제 출간 제목은 '고독한 군중'
  ['blind-05', '열린 결말을 사랑한 사람들'], // 가상의 책 — 결과 없음
  ['blind-06', '달러구트 꿈 백화점 이미예'],
  ['blind-07', '아몬드 손원평 창비'],
  ['blind-08', '미드나잇 라이브러리 매트 헤이그'],
  ['blind-09', '파친코 1 이민진'],
  ['blind-10', '데미안 헤르만 헤세 민음사'],
  ['blind-11', '죽고 싶지만 떡볶이는 먹고 싶어 백세희'],
  ['blind-12', '총 균 쇠 재레드 다이아몬드'],
  ['blind-13', '불편한 편의점 김호연'],
  ['blind-14', '호밀밭의 파수꾼 샐린저 민음사'],
  ['blind-15', '구의 증명 최진영'],
  // 평가 탭 카탈로그 (data/books.ts) — blind와 겹치지 않는 코드만
  ['book-03', '여행의 이유 김영하'],
  ['book-04', '검은 꽃 김영하'],
  ['book-08', '픽션들 보르헤스'],
  ['book-09', '채식주의자 한강'],
  ['book-10', '소년이 온다 한강'],
  ['book-11', '우리가 빛의 속도로 갈 수 없다면 김초엽'],
  ['book-12', '지구 끝의 온실 김초엽'],
  ['book-13', '노르웨이의 숲 무라카미 하루키'],
  ['book-14', '1Q84 1 무라카미 하루키'],
  ['book-15', '나의 투쟁 2 크나우스고르'],
]

for (const [code, query] of TARGETS) {
  try {
    const res = await fetch(
      `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(query)}&size=3`,
      { headers: { Authorization: `KakaoAK ${key}` } },
    )
    if (!res.ok) {
      console.log(`✗ ${code} — API ${res.status}`)
      continue
    }
    const data = await res.json()
    const doc = data.documents?.find((d) => d.thumbnail) ?? null
    if (!doc) {
      console.log(`— ${code} — 검색 결과 없음 (${query})`)
      continue
    }
    // 카카오 썸네일(120px)의 fname 파라미터에서 원본 CDN 이미지(고해상도)를 추출
    const fname = new URL(doc.thumbnail).searchParams.get('fname')
    let imgRes = await fetch(fname ?? doc.thumbnail)
    if (!imgRes.ok) imgRes = await fetch(doc.thumbnail) // 원본 실패 시 썸네일로 폴백
    if (!imgRes.ok) {
      console.log(`✗ ${code} — 이미지 다운로드 실패`)
      continue
    }
    const buf = Buffer.from(await imgRes.arrayBuffer())
    const tmp = join(OUT, `${code}.tmp.jpg`)
    writeFileSync(tmp, buf)
    // IllustPlaceholder는 .png를 요청하므로 sips로 변환
    execSync(`sips -s format png "${tmp}" --out "${join(OUT, `${code}.png`)}" >/dev/null 2>&1 && rm "${tmp}"`)
    console.log(`✓ ${code} ← ${doc.title} (${doc.publisher})`)
  } catch (e) {
    console.log(`✗ ${code} — ${e.message}`)
  }
}
