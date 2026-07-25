import Link from 'next/link'
import type { ReactNode } from 'react'

/* 13. BOTTOM NAVIGATION — 컨테이너 + NavItem
   라우팅 상태(active 판단)는 화면 단계의 책임. 여기서는 props로만 받는다. */

export function BottomNav({ children }: { children: ReactNode }) {
  return <nav className="bj-bottomnav">{children}</nav>
}

interface NavItemProps {
  icon: ReactNode
  label: string
  active?: boolean
  href?: string
  onClick?: () => void
}

export function NavItem({ icon, label, active = false, href, onClick }: NavItemProps) {
  const className = `bj-navitem${active ? ' bj-navitem--active' : ''}`
  const content = (
    <>
      {icon}
      <span>{label}</span>
    </>
  )
  if (href) {
    return (
      <Link href={href} className={className} aria-current={active ? 'page' : undefined}>
        {content}
      </Link>
    )
  }
  return (
    <button type="button" className={className} aria-current={active ? 'page' : undefined} onClick={onClick}>
      {content}
    </button>
  )
}
