'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import BackLink from '@/shared/ui/BackLink'
import { loadNotifications, markAllRead } from '@/entities/notification/api/notificationsRemote'
import { describeNotification, type AppNotification } from '@/entities/notification/model/notifications'
import { formatRelTime } from '@/entities/post/model/relTime'

export default function NotificationsView() {
  const [items, setItems] = useState<AppNotification[] | null>(null)

  useEffect(() => {
    async function load() {
      const list = await loadNotifications()
      setItems(list)
      if (list.some((n) => !n.read)) await markAllRead()
    }
    void load()
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">알림</span>
        </header>

        <div className="bj-content">
          {items === null ? (
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
                  <p className="bj-body bj-body--sm">{text}</p>
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
