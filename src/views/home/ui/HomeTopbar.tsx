import Link from 'next/link'
import { Logo } from '@/shared/ui'

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

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
        <Link href="/search" className="bj-icon-btn" aria-label="검색">
          <SearchIcon />
        </Link>
        <Link href="/notifications" className="bj-icon-btn" aria-label="알림">
          <BellIcon />
        </Link>
      </div>
    </header>
  )
}
