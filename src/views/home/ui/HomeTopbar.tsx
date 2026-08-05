'use client'

import Link from 'next/link'
import { Logo, IconButton } from '@/shared/ui'
import { SearchIcon, BellIcon } from './icons'

/* 상단바 — 로고 블록(리소 * 마크 + BOOKJAK) | 슬로건 | 검색·알림
   검색/알림은 대응 라우트가 아직 없어 비활성 버튼으로만 자리를 잡는다. */

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
          <span className="bj-icon-btn__dot" aria-hidden="true" />
          <BellIcon />
        </IconButton>
      </div>
    </header>
  )
}
