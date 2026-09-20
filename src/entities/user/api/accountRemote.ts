import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

/** 회원 탈퇴 — auth.users 삭제(RPC). 연관 데이터는 FK cascade로 즉시 삭제된다. */
export async function deleteMyAccount(): Promise<void> {
  const sb = createSupabaseBrowser()
  const { error } = await sb.rpc('delete_my_account')
  if (error) throw new Error(error.message)
  await sb.auth.signOut()
}
