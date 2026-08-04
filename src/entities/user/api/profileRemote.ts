import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export interface Profile {
  id: string
  nickname: string
  avatar_url: string | null
}

export async function fetchProfile(): Promise<Profile | null> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return null

  const { data } = await sb
    .from('profiles')
    .select('id, nickname, avatar_url')
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

export async function signOut(): Promise<void> {
  const sb = createSupabaseBrowser()
  await sb.auth.signOut()
}
