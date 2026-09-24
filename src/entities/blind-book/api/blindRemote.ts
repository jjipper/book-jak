import type { BlindBook, RevealedBook } from '@/entities/blind-book/model/blindBooks'

export interface TodayBlind {
  date: string
  theme: string // 오늘의 요일 테마 라벨 ('소설' 등)
  books: BlindBook[]
}

export async function fetchTodayBlind(): Promise<TodayBlind | null> {
  const res = await fetch('/api/blind/today', { cache: 'no-store' }).catch(() => null)
  return res?.ok ? ((await res.json()) as TodayBlind) : null
}

type ActResult =
  | { ok: true; balance?: number; book?: RevealedBook }
  | { ok: false; error: 'NO_TOKEN' | 'LOGIN_REQUIRED' | 'STALE' | string }

async function act(date: string, index: number, action: 'pass' | 'save' | 'reveal'): Promise<ActResult> {
  const res = await fetch('/api/blind/today', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, index, action }),
  }).catch(() => null)
  if (!res) return { ok: false, error: 'NETWORK' }
  const body = await res.json().catch(() => ({}))
  return res.ok ? { ok: true, ...body } : { ok: false, error: body.error ?? 'UNKNOWN' }
}

/** 넘어가기·서재 담기 기록 — 진행도 저장용이라 실패해도 화면은 넘어간다 */
export function recordBlind(date: string, index: number, action: 'pass' | 'save'): void {
  void act(date, index, action)
}

/** 공개 — 서버가 토큰 1개를 차감하고(이미 공개한 책은 무료) 책 정보를 돌려준다 */
export const revealBlind = (date: string, index: number) => act(date, index, 'reveal')
