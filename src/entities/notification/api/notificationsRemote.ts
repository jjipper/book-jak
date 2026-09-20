import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { AppNotification, NotificationType } from '@/entities/notification/model/notifications'

/** 내 알림 목록 (최신순) */
export async function loadNotifications(limit = 50): Promise<AppNotification[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('notifications')
    .select('id, type, actor_id, target_id, target_type, read, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (!data?.length) return []

  const actorIds = [...new Set(data.map((r) => r.actor_id).filter(Boolean))] as string[]
  const nicknames = new Map<string, string>()
  if (actorIds.length) {
    const { data: profiles } = await sb.from('profiles').select('id, nickname').in('id', actorIds)
    profiles?.forEach((p) => nicknames.set(p.id as string, p.nickname as string))
  }

  return data.map((r) => ({
    id: r.id as string,
    type: r.type as NotificationType,
    actorNickname: nicknames.get(r.actor_id as string) ?? '누군가',
    targetId: (r.target_id as string | null) ?? null,
    targetType: (r.target_type as string | null) ?? null,
    read: Boolean(r.read),
    ts: new Date(r.created_at as string).getTime(),
  }))
}

/** 안읽음 개수 */
export async function countUnread(): Promise<number> {
  const sb = createSupabaseBrowser()
  const { count } = await sb
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('read', false)
  return count ?? 0
}

/** 전부 읽음 처리 */
export async function markAllRead(): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  await sb.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
}
