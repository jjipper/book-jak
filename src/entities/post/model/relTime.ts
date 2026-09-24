/** 타임스탬프 → "5시간 전" 같은 상대 시간 (피드 카드·글 상세·댓글·알림·모임 게시판 공용) */
export function formatRelTime(ts: number): string {
  const m = Math.floor((Date.now() - ts) / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  // 일주일이 넘으면 "12일 전"은 감이 안 온다 — 날짜로 끊는다
  if (d < 7) return `${d}일 전`
  const date = new Date(ts)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}
