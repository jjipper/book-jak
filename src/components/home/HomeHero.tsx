'use client'

import Link from 'next/link'
import type { TypeCode } from '@/data/readingTypes'
import { TEST_PARTICIPANT_COUNT } from '@/data/stats'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import { ArrowRightIcon } from './icons'

/* 히어로 배너 — 독서 유형 테스트 진입.
   결과 보유 유저는 CTA가 "내 유형 카드 보기"로 분기한다. */

interface HomeHeroProps {
  typeCode: TypeCode | null
}

export default function HomeHero({ typeCode }: HomeHeroProps) {
  const cta = typeCode
    ? { href: `/result/${typeCode}`, label: '내 유형 카드 보기' }
    : { href: '/test', label: '테스트 시작' }

  return (
    <section className="bj-hero" style={{ marginTop: 'var(--space-xs)' }}>
      <div className="bj-hero__illust">
        <IllustPlaceholder code="hero" alt="독서 유형 테스트" aspectRatio="3 / 4" />
      </div>
      <div className="bj-hero__body">
        <p className="bj-hero__eyebrow" style={{ margin: 0 }}>독서 유형 테스트</p>
        <h1 className="bj-hero__title" style={{ margin: 0 }}>나의 독서 유형은?</h1>
        <p className="bj-hero__sub" style={{ margin: 0 }}>12문항으로 16가지 유형 중 내 자리를 찾아요</p>
        <Link
          href={cta.href}
          className="bj-btn bj-btn--primary bj-btn--pill"
          style={{ marginTop: 'var(--space-md)', fontSize: 'var(--fs-body-sm)', padding: 'var(--space-sm) var(--space-lg)' }}
        >
          {cta.label}
          <ArrowRightIcon />
        </Link>
        <p className="bj-hero__count" style={{ margin: 'var(--space-sm) 0 0' }}>
          지금까지 <b>{TEST_PARTICIPANT_COUNT.toLocaleString('ko-KR')}명</b> 참여했어요
        </p>
      </div>
    </section>
  )
}
