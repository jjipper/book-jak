// Supabase 클라이언트 — env 키가 없으면 null을 돌려주고 앱은 localStorage 모드로 동작
// 로그인 UI 없이 익명 세션(signInAnonymously)으로 사용자를 식별한다.

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key) : null
  return client
}


// 익명 세션 보장 — 이미 세션이 있으면 재사용, 없으면 새로 발급
export async function ensureSession(): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data: { session } } = await sb.auth.getSession()
  if (session) return session.user.id
  const { data, error } = await sb.auth.signInAnonymously()
  if (error) {
    console.warn('익명 로그인 실패 (Supabase에서 Anonymous sign-ins가 켜져 있는지 확인):', error.message)
    return null
  }
  return data.user?.id ?? null
}
