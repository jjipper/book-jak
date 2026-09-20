// 알림 — notifications 테이블 (생성은 Postgres 트리거가 담당, 앱은 읽기/읽음처리만)

export type NotificationType = 'follow' | 'like' | 'comment' | 'answer' | 'club'

export interface AppNotification {
  id: string
  type: NotificationType
  actorNickname: string
  targetId: string | null
  targetType: string | null
  read: boolean
  ts: number
}

/** 알림 문구 + 이동 경로 */
export function describeNotification(n: AppNotification): { text: string; href: string | null } {
  const who = n.actorNickname
  switch (n.type) {
    case 'follow':
      return { text: `${who}님이 나를 팔로우했어요`, href: n.targetId ? `/people/${n.targetId}` : null }
    case 'like': {
      if (!n.targetId) return { text: `${who}님이 내 글을 좋아해요`, href: null }
      const href = n.targetType === 'question' ? `/social/discuss/${n.targetId}` : `/post/${n.targetId}`
      return { text: `${who}님이 내 글을 좋아해요`, href }
    }
    case 'comment':
      return { text: `${who}님이 내 글에 댓글을 남겼어요`, href: n.targetId ? `/post/${n.targetId}` : null }
    case 'answer':
      return { text: `${who}님이 내 질문에 답변했어요`, href: n.targetId ? `/social/discuss/${n.targetId}` : null }
    case 'club':
      return { text: `${who}님이 내 모임에 참여했어요`, href: n.targetId ? `/social/clubs/${n.targetId}` : null }
  }
}
