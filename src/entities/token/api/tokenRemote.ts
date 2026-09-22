import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

/** 내 토큰 잔액. 비로그인·실패면 null */
export async function fetchTokenBalance(): Promise<number | null> {
  const { data, error } = await createSupabaseBrowser().rpc('my_token_balance')
  return error ? null : (data as number)
}

/** 오늘 출석 토큰 받기 — 새로 받았으면 true (하루 한 번은 DB unique가 보장) */
export async function claimAttendance(): Promise<boolean> {
  const { data, error } = await createSupabaseBrowser().rpc('claim_attendance')
  return !error && data === true
}
