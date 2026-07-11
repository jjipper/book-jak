// 발견 탭 — 날짜 시드 기반 '오늘의 발견' 5권 선정
// 같은 날짜는 항상 같은 구성이 나오도록 결정적 셔플을 쓴다. 홈 미리보기에서도 공유.

import { BLIND_BOOKS, type BlindBook } from '@/data/blindBooks'

export const BOOKS_PER_DAY = 5
export const MAX_PAST_DAYS = 13 // 뒤로 이동 가능한 일수

export function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

export function pickDailyBooks(key: string): BlindBook[] {
  let seed = 0
  for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) | 0
  seed = Math.abs(seed)
  const arr = [...BLIND_BOOKS]
  for (let i = arr.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff
    const j = seed % (i + 1)
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, BOOKS_PER_DAY)
}
