import Link from 'next/link'
import { Logo } from '@/shared/ui'

const FOOTER_LINKS = [
  { label: '서비스 소개', href: '/about' },
  { label: '이용약관', href: '/terms' },
  { label: '개인정보처리방침', href: '/privacy' },
  { label: '문의하기', href: 'mailto:jj.choi@sqisoft.com' },
  { label: '공지사항', href: '/notice' },
]

export default function HomeFooter() {
  return (
    <footer className="bj-footer">
      <Logo />
      <p className="bj-footer__tag">읽는 취향이, 나를 만든다</p>
      <div className="bj-footer__links">
        {FOOTER_LINKS.map(({ label, href }) => (
          <Link key={label} href={href}>{label}</Link>
        ))}
      </div>
      <p className="bj-footer__copy">
        북작(BOOKJAK) · 독서 취향 소셜
        <br />© 2026 BOOKJAK. All rights reserved.
      </p>
    </footer>
  )
}
