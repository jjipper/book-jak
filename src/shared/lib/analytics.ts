import posthog from 'posthog-js'

// 퍼널 이벤트 이름은 여기서만 정한다 — PostHog 대시보드의 퍼널이 이 이름에 묶인다
type FunnelEvent =
  | 'quiz_started'
  | 'quiz_completed'
  | 'result_shared'
  | 'result_image_saved'
  | 'blind_book_passed'
  | 'blind_book_revealed'
  | 'blind_book_saved'
  | 'club_interest_toggled'
  | 'login_clicked'

export function track(event: FunnelEvent, props?: Record<string, unknown>) {
  if (posthog.__loaded) posthog.capture(event, props)
}

// 로그인 사용자를 Supabase id로 묶는다 — 익명 시절 이벤트도 같은 사람으로 합쳐진다
export function identify(userId: string) {
  if (posthog.__loaded) posthog.identify(userId)
}

// 로그아웃·탈퇴 후 다음 사람이 같은 기기에서 이어 붙지 않게
export function resetIdentity() {
  if (posthog.__loaded) posthog.reset()
}
