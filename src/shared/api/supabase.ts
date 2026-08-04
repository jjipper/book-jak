import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null | undefined

export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  client = url && key ? createClient(url, key) : null
  return client
}

// 카카오 OAuth 세션에서 userId 반환 — 미인증이면 null
export async function ensureSession(): Promise<string | null> {
  const sb = getSupabase()
  if (!sb) return null
  const { data: { user } } = await sb.auth.getUser()
  return user?.id ?? null
}
