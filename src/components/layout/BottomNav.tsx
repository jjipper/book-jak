'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '/home', label: '홈',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-action)' : 'none'} stroke={active ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/discover', label: '발견',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    href: '/rate', label: '평가',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'var(--color-action)' : 'none'} stroke={active ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.63 22 9.27 16.5 13.97 18.18 21 12 17.27 5.82 21 7.5 13.97 2 9.27 8.91 8.63 12 2" />
      </svg>
    ),
  },
  {
    href: '/social', label: '소셜',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/my', label: '마이',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--color-action)' : 'var(--color-text-hint)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bj-navbar">
      {NAV_ITEMS.map(({ href, label, icon }) => {
        const isActive = href === '/home' ? (pathname === '/' || pathname.startsWith('/home')) : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`bj-navbar__item${isActive ? ' is-active' : ''}`}
          >
            {icon(isActive)}
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
