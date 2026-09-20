import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

/**
 * 회원 탈퇴 — 익명화(RPC). 계정·프로필 개인정보는 파기되지만
 * 작성한 글·댓글·답변은 '탈퇴한 사용자' 이름으로 남는다.
 */
export async function deleteMyAccount(): Promise<void> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.rpc('withdraw_my_account')
  if (error) throw new Error(error.message)
  await sb.auth.signOut()
}
