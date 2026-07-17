'use client'

import Link from 'next/link'
import { Logo, IconButton } from '@/components/atoms'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import { SearchIcon, BellIcon, PersonIcon } from './icons'

/* 상단바 — 로고(리소 마크 1회) + 검색·알림·아바타
   검색/알림은 대응 라우트가 아직 없어 비활성 버튼으로만 자리를 잡는다. */

interface HomeTopbarProps {
  typeCode: string | null
}

export default function HomeTopbar({ typeCode }: HomeTopbarProps) {
  return (
    <header className="bj-topbar">
      <Link href="/home" style={{ textDecoration: 'none', color: 'inherit' }}>
        <Logo riso />
      </Link>
      <div className="bj-topbar__actions">
        <IconButton label="검색">
          <SearchIcon />
        </IconButton>
        <IconButton label="알림">
          <span className="bj-icon-btn__dot" aria-hidden="true" />
          <BellIcon />
        </IconButton>
        <Link href="/my" className="bj-avatar" aria-label="마이페이지">
          {typeCode ? (
            <IllustPlaceholder code={typeCode} alt="내 유형" aspectRatio="1 / 1" />
          ) : (
            <span style={{ color: 'var(--color-text-caption)', display: 'inline-flex' }}>
              <PersonIcon />
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
