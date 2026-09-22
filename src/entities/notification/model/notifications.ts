// 알림 — notifications 테이블 (생성은 Postgres 트리거가 담당, 앱은 읽기/읽음처리만)

export type NotificationType = 'follow' | 'like' | 'comment' | 'club' | 'new_post' | 'recommend' | 'rec_review'

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
    case 'like':
      return { text: `${who}님이 내 글을 좋아해요`, href: n.targetId ? `/posts/${n.targetId}` : null }
    case 'comment':
      return { text: `${who}님이 내 글에 댓글을 남겼어요`, href: n.targetId ? `/posts/${n.targetId}` : null }
    case 'club':
      return { text: `${who}님이 내 모임에 참여했어요`, href: n.targetId ? `/social/clubs/${n.targetId}` : null }
    case 'new_post':
      return { text: `${who}님이 새 글을 올렸어요`, href: n.targetId ? `/posts/${n.targetId}` : null }
    // recommend·rec_review: target_type='rec_request', target_id=추천 요청 id (0016 트리거 규약)
    case 'recommend':
      return { text: `${who}님이 내 요청에 책을 추천했어요`, href: n.targetId ? `/social/recommend/${n.targetId}` : null }
    case 'rec_review':
      return { text: `${who}님이 내 추천에 후기를 남겼어요`, href: n.targetId ? `/social/recommend/${n.targetId}` : null }
    default: // 'answer' 등 더는 만들지 않는 과거 알림
      return { text: `${who}님의 소식이 있어요`, href: null }
  }
}

/** 팔로잉 활동 — following_activity() RPC 한 행 */
export interface FollowingActivity {
  kind: 'post' | 'rating'
  actorId: string
  actorNickname: string
  targetId: string
  title: string
  stars: number | null
  ts: number
}

export function describeActivity(a: FollowingActivity): { text: string; href: string } {
  return a.kind === 'post'
    ? { text: `새 글을 올렸어요 · ${a.title}`, href: `/posts/${a.targetId}` }
    : { text: `『${a.title}』에 별점 ${a.stars}점을 줬어요`, href: `/rate/books/${a.targetId}` }
}
