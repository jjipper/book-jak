// Phase 4/5 — 활동 점수 (localStorage 임시)
// "읽고 - 평가하고 - 리뷰 쓰고 - 모임 참여하고 - 코멘트 달고" 활동을 점수로 환산

export type ActivityType =
  | 'test'
  | 'blind_rating'
  | 'book_rating'
  | 'review'
  | 'club_create'
  | 'club_join'

interface ActivityEvent {
  type: ActivityType
  ts: number
}

const STORAGE_KEY = 'book_activity_log'

const POINTS: Record<ActivityType, number> = {
  test: 15,
  blind_rating: 5,
  book_rating: 5,
  review: 5,
  club_create: 10,
  club_join: 5,
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  test: 'BOOKBTI 테스트',
  blind_rating: '블라인드 북 평가',
  book_rating: '책 평가',
  review: '한 줄 리뷰',
  club_create: '모임 개설',
  club_join: '모임 참여',
}

function loadLog(): ActivityEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ActivityEvent[]) : []
  } catch {
    return []
  }
}

export function recordActivity(type: ActivityType): void {
  if (typeof window === 'undefined') return
  const log = loadLog()
  log.push({ type, ts: Date.now() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log))
}

export function getActivityScore(): number {
  return loadLog().reduce((sum, e) => sum + POINTS[e.type], 0)
}

export function getActivitySummary(): Record<ActivityType, number> {
  const summary = {
    test: 0, blind_rating: 0, book_rating: 0, review: 0, club_create: 0, club_join: 0,
  } as Record<ActivityType, number>
  for (const e of loadLog()) summary[e.type]++
  return summary
}
