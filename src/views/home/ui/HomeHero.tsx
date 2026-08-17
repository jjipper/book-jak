import Link from 'next/link'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

interface HomeHeroProps {
  typeCode: TypeCode | null
}

export default function HomeHero({ typeCode }: HomeHeroProps) {
  const cta = typeCode
    ? { href: `/result/${typeCode}`, label: '내 유형 카드 보기' }
    : { href: '/test', label: '독서유형 테스트 시작하기' }

  return (
    <section className="bj-hero">
      <div className="bj-hero__illust">
        <IllustPlaceholder
          code="intro_test"
          alt="독서 유형 테스트"
          aspectRatio="1 / 1"
          fit="contain"
          background="transparent"
        />
      </div>
      <div className="bj-hero__body">
        <h1 className="bj-hero__title">나의 독서 유형은 무엇일까?</h1>
        <p className="bj-hero__sub">12문항으로 16가지 독서 유형을 진단해보세요!</p>
        <Link href={cta.href} className="bj-btn bj-btn--primary bj-hero__cta">
          {cta.label}
          <ArrowRightIcon />
        </Link>
      </div>
    </section>
  )
}
