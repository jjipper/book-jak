import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
  type_code: string | null
}

export async function fetchProfile(): Promise<Profile | null> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  const { data } = await sb
    .from('profiles')
    .select('id, nickname, avatar_url, type_code')
    .eq('id', user.id)
    .single()
  return data ?? null
}

export async function upsertProfile(nickname: string, avatar_url?: string | null): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  const payload: Record<string, unknown> = {
    id: user.id,
    nickname,
    updated_at: new Date().toISOString(),
  }
  if (avatar_url !== undefined) payload.avatar_url = avatar_url

  const { error } = await sb.from('profiles').upsert(payload)
  if (error) throw error
}

// 독서 유형 서버 백업 — 비로그인이거나 프로필 행이 아직 없으면 조용히 무시
export async function saveTypeCode(typeCode: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return

  const { error } = await sb.from('profiles').update({ type_code: typeCode }).eq('id', user.id)
  if (error) throw error
}

export async function signOut(): Promise<void> {
  const sb = createSupabaseBrowser()
  await sb.auth.signOut()
}
