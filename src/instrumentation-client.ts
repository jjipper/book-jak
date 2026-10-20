import posthog from 'posthog-js'

// 퍼널·클릭 자동수집·세션 녹화. 키가 없으면(로컬 등) 아예 켜지 않는다
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    defaults: '2026-08-30', // SPA 라우트 이동 시 $pageview·$pageleave 자동
    person_profiles: 'identified_only', // 비로그인 방문자는 익명 이벤트만
  })
}
