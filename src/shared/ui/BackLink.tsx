import Link from 'next/link'
import Icon from './Icon'

/* 서브페이지 헤더 뒤로가기 — Figma 02 Components > 서브페이지 헤더 SubpageHead */

export default function BackLink({ href }: { href: string }) {
  return (
    <Link href={href} className="bj-icon-btn" aria-label="뒤로">
      <Icon name="chevron-left" size={24} />
    </Link>
  )
}
