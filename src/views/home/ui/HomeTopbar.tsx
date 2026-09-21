'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/shared/ui'
import Icon from '@/shared/ui/Icon'
import { countUnread } from '@/entities/notification/api/notificationsRemote'

export default function HomeTopbar() {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    countUnread().then(setUnread, () => {})
  }, [])

  return (
    <header className="bj-topbar">
      <div className="bj-topbar__brand">
        <Link href="/home" className="bj-unstyled-link">
          <Logo riso />
        </Link>
        <span className="bj-topbar__divider" aria-hidden="true" />
        <div className="bj-topbar__slogan">
          <p className="bj-topbar__slogan-main">읽는 취향이, 나를 만든다</p>
          <p className="bj-topbar__slogan-sub">독서 취향 소셜 앱</p>
        </div>
      </div>
      <div className="bj-topbar__actions">
        <Link href="/search" className="bj-icon-btn" aria-label="검색">
          <Icon name="search" size={24} />
        </Link>
        <Link href="/notifications" className="bj-icon-btn" aria-label={unread ? `알림 ${unread}개 안읽음` : '알림'}>
          <Icon name="bell" size={24} />
          {unread > 0 && (
            <span
              aria-hidden="true"
              style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--color-accent)' }}
            />
          )}
        </Link>
      </div>
    </header>
  )
}
