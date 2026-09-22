// 홈 사람 슬라이드용 가벼운 조회 — BOOKBTI 같은 사람 / 요즘 활발한 사람

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'

export interface RailPerson {
  id: string
  nickname: string
  typeCode: TypeCode | null
}

type Sb = ReturnType<typeof createSupabaseBrowser>

async function myId(sb: Sb): Promise<string | null> {
  const { data: { user } } = await sb.auth.getUser()
  return user?.id ?? null
}

/** 나와 BOOKBTI(profiles.type_code)가 같은 사람. 나·탈퇴자 제외 */
export async function loadSameTypePeople(typeCode: TypeCode, limit = 8): Promise<RailPerson[]> {
  const sb = createSupabaseBrowser()
  const me = await myId(sb)
  let query = sb
    .from('profiles')
    .select('id, nickname, type_code')
    .eq('type_code', typeCode)
    .is('withdrawn_at', null)
    .limit(limit)
  if (me) query = query.neq('id', me)
  const { data } = await query
  return (data ?? []).map((r) => ({ id: r.id, nickname: r.nickname, typeCode: r.type_code as TypeCode | null }))
}

/** 최근 7일 글·평가 수가 많은 사람 순 */
export async function loadActivePeople(limit = 8): Promise<RailPerson[]> {
  const sb = createSupabaseBrowser()
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  // ponytail: 최근 행을 가져와 JS에서 센다(각 1000행 상한). 활동량이 커지면 집계 RPC로.
  const [me, posts, ratings] = await Promise.all([
    myId(sb),
    sb.from('posts').select('author_id').gte('created_at', since).limit(1000),
    sb.from('ratings').select('user_id').gte('created_at', since).limit(1000),
  ])

  const counts = new Map<string, number>()
  const bump = (id: string) => counts.set(id, (counts.get(id) ?? 0) + 1)
  for (const r of (posts.data ?? []) as { author_id: string }[]) bump(r.author_id)
  for (const r of (ratings.data ?? []) as { user_id: string }[]) bump(r.user_id)
  if (me) counts.delete(me)

  // 탈퇴자가 빠질 수 있어 여유 있게 뽑는다 — in() 목록이 URL에 실리니 길게 두지 않는다
  const ids = [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!).slice(0, limit * 2)
  if (ids.length === 0) return []
  const { data } = await sb
    .from('profiles')
    .select('id, nickname, type_code')
    .in('id', ids)
    .is('withdrawn_at', null)
  return (data ?? [])
    .map((r) => ({ id: r.id, nickname: r.nickname, typeCode: r.type_code as TypeCode | null }))
    .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
    .slice(0, limit)
}
