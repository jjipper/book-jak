import Link from 'next/link'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface HomeHeroProps {
  typeCode: TypeCode | null
}

export default function HomeHero({ typeCode }: HomeHeroProps) {
  const cta = typeCode
    ? { href: `/result/${typeCode}`, label: '내 유형 카드 보기' }
    : { href: '/test', label: '테스트 시작' }

  return (
    <section className="bj-hero">
      <div className="bj-hero__illust">
        <IllustPlaceholder
          code="intro_test"
          alt="BOOKBTI 테스트"
          aspectRatio="1 / 1"
          fit="contain"
          background="transparent"
        />
      </div>
      <div className="bj-hero__body">
        <h1 className="bj-hero__title">나의 BOOKBTI는 무엇일까?</h1>
        <p className="bj-hero__sub">12문항으로 16가지 독서 유형 중 나를 찾아보세요</p>
        <Link href={cta.href} className="bj-btn bj-btn--primary bj-hero__cta">
          {cta.label}
        </Link>
      </div>
    </section>
  )
}
