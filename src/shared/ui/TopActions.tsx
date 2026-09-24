'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/shared/ui/Icon'
import { countUnread } from '@/entities/notification/api/notificationsRemote'

/* 하단 탭 화면 공통 우측 상단 액션 — 검색·알림.
   홈은 자체 상단바(HomeTopbar)에 같은 버튼이 있어 여기선 렌더하지 않는다. */
const TAB_ROUTES = ['/discover', '/rate', '/social', '/my']

export default function TopActions() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)
  // 탭 루트에서만 — 하위 페이지는 각자 뒤로가기 헤더가 있다
  const show = TAB_ROUTES.includes(pathname)

  useEffect(() => {
    if (show) countUnread().then(setUnread, () => {})
  }, [show])

  if (!show) return null

  return (
    <div className="bj-topactions">
      <div className="bj-topactions__inner">
        <Link href="/search" className="bj-icon-btn" aria-label="검색">
          <Icon name="search" size={24} />
        </Link>
        <Link
          href="/notifications"
          className="bj-icon-btn"
          aria-label={unread ? `알림 ${unread}개 안읽음` : '알림'}
        >
          <Icon name="bell" size={24} />
          {unread > 0 && <span className="bj-topactions__dot" aria-hidden="true" />}
        </Link>
      </div>
    </div>
  )
}
