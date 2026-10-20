'use client'

import { usePathname } from 'next/navigation'
import { BottomNav as NavShell, NavItem } from '@/shared/ui'
import Icon, { type IconName } from '@/shared/ui/Icon'

/* 앱 하단 탭 — v2 아토믹(BottomNav/NavItem) 조합.
   아이콘은 면(채움) 24, 색은 CSS(currentColor)가 담당. */

const NAV_ITEMS: { href: string; label: string; icon: IconName }[] = [
  { href: '/home', label: '홈', icon: 'home' },
  { href: '/discover', label: '발견', icon: 'compass' },
  { href: '/rate', label: '평가', icon: 'star' },
  { href: '/social', label: '모임', icon: 'people' },
  { href: '/my', label: '마이', icon: 'user' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <div className="bj-bottomnav-dock">
      <NavShell>
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const isActive =
            href === '/home'
              ? pathname === '/' || pathname.startsWith('/home')
              : pathname.startsWith(href)
          return <NavItem key={href} href={href} label={label} icon={<Icon name={icon} size={24} />} active={isActive} />
        })}
      </NavShell>
    </div>
  )
}
