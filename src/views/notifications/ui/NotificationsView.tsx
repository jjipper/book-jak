'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BackLink from '@/shared/ui/BackLink'
import { getFollowingIds } from '@/features/follow/model/follows'
import { loadFollowingActivity, loadNotifications, markAllRead } from '@/entities/notification/api/notificationsRemote'
import {
  describeActivity,
  describeNotification,
  type AppNotification,
  type FollowingActivity,
} from '@/entities/notification/model/notifications'
import { formatRelTime } from '@/entities/post/model/relTime'

export default function NotificationsView() {
  const [tab, setTab] = useState<'mine' | 'following'>('mine')
  const [items, setItems] = useState<AppNotification[] | null>(null)
  // null = 아직 안 불러옴, noFollows = 팔로우 0명
  const [activity, setActivity] = useState<{ list: FollowingActivity[]; noFollows: boolean } | null>(null)

  useEffect(() => {
    async function load() {
      const list = await loadNotifications()
      setItems(list)
      if (list.some((n) => !n.read)) await markAllRead()
    }
    void load()
  }, [])

  useEffect(() => {
    if (tab !== 'following' || activity) return
    void Promise.all([getFollowingIds(), loadFollowingActivity()]).then(([ids, list]) =>
      setActivity({ list, noFollows: ids.length === 0 }),
    )
  }, [tab, activity])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">알림</span>
        </header>

        <div className="bj-content">
          <div className="bj-rail bj-mb-12">
            <button
              type="button"
              onClick={() => setTab('mine')}
              aria-pressed={tab === 'mine'}
              className={`bj-chip${tab === 'mine' ? ' bj-chip--active' : ''}`}
            >
              내 소식
            </button>
            <button
              type="button"
              onClick={() => setTab('following')}
              aria-pressed={tab === 'following'}
              className={`bj-chip${tab === 'following' ? ' bj-chip--active' : ''}`}
            >
              팔로잉 활동
            </button>
          </div>

          {tab === 'following' ? (
            activity === null ? (
              <p className="bj-caption bj-text-muted bj-text-center">불러오는 중…</p>
            ) : activity.noFollows || activity.list.length === 0 ? (
              <div className="bj-empty bj-card">
                <p className="bj-body bj-bold bj-mb-6">
                  {activity.noFollows ? '아직 팔로우한 사람이 없어요' : '아직 새 활동이 없어요'}
                </p>
                <p className="bj-caption bj-text-muted bj-mb-12">
                  취향 비슷한 사람을 팔로우하면<br />새 글과 별점이 여기 모여요
                </p>
                <Link href="/home" className="bj-btn bj-btn--secondary">홈으로</Link>
              </div>
            ) : (
              activity.list.map((a) => {
                const { text, href } = describeActivity(a)
                return (
                  <div key={`${a.kind}-${a.actorId}-${a.targetId}`} className="bj-row bj-row--top">
                    <div className="bj-flex-1">
                      <p className="bj-body bj-body--sm">
                        <Link href={`/people/${a.actorId}`} className="bj-unstyled-link bj-bold">
                          {a.actorNickname}
                        </Link>
                        {'님이 '}
                        <Link href={href} className="bj-unstyled-link">{text}</Link>
                      </p>
                      <p className="bj-caption">{formatRelTime(a.ts)}</p>
                    </div>
                  </div>
                )
              })
            )
          ) : items === null ? (
            <p className="bj-caption bj-text-muted bj-text-center">불러오는 중…</p>
          ) : items.length === 0 ? (
            <div className="bj-empty bj-card">
              <p className="bj-body bj-bold bj-mb-6">아직 알림이 없어요</p>
              <p className="bj-caption bj-text-muted">
                팔로우, 좋아요, 댓글이 생기면<br />여기에 쌓여요
              </p>
            </div>
          ) : (
            items.map((n) => {
              const { text, href } = describeNotification(n)
              const body = (
                <div className="bj-flex-1">
                  <p className={`bj-body bj-body--sm${n.read ? '' : ' bj-bold'}`}>{text}</p>
                  <p className="bj-caption">{formatRelTime(n.ts)}</p>
                </div>
              )
              return href ? (
                <Link key={n.id} href={href} className="bj-row bj-row--top bj-unstyled-link">
                  {body}
                </Link>
              ) : (
                <div key={n.id} className="bj-row bj-row--top">{body}</div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
