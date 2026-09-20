// 신고 / 차단 / 내 글 삭제

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'

export const REPORT_REASONS = ['스팸·광고', '욕설·혐오 표현', '음란물', '허위 정보', '기타'] as const

export type ReportTargetType = 'post' | 'comment' | 'user'

/** 신고 등록 (중복 신고는 무시) */
export async function reportContent(
  targetType: ReportTargetType,
  targetId: string,
  reason: string,
): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  await sb.from('reports').upsert(
    { reporter_id: user.id, target_type: targetType, target_id: targetId, reason },
    { onConflict: 'reporter_id,target_type,target_id' },
  )
}

export async function blockUser(userId: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.id === userId) return
  await sb.from('blocks').upsert({ blocker_id: user.id, blocked_id: userId })
}

export async function unblockUser(userId: string): Promise<void> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  if (!user) return
  await sb.from('blocks').delete().eq('blocker_id', user.id).eq('blocked_id', userId)
}

/** 내가 차단한 유저 id 목록 (RLS가 본인 것만 돌려준다) */
export async function getBlockedIds(): Promise<string[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('blocks').select('blocked_id')
  return data?.map((r) => r.blocked_id as string) ?? []
}
