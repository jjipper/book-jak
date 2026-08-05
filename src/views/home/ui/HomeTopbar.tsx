'use client'

import Link from 'next/link'
import { Logo, IconButton } from '@/shared/ui'
import { SearchIcon, BellIcon } from './icons'

export default function HomeTopbar() {
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
        <IconButton label="검색">
          <SearchIcon />
        </IconButton>
        <IconButton label="알림">
          <BellIcon />
        </IconButton>
      </div>
    </header>
  )
}
