'use client'

import Link from 'next/link'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { TEST_PARTICIPANT_COUNT } from '@/views/home/model/stats'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { ArrowRightIcon } from './icons'

/* 히어로 배너 — 독서 유형 테스트 진입. 주황 테두리 + 참여 수 starburst(시안).
   결과 보유 유저는 CTA가 "내 유형 카드 보기"로 분기한다. */

/* 16꼭지 별 (atoms/RarityBadge와 동일 도형) */
const STARBURST_POINTS =
  '50.0,1.0 57.8,10.8 68.8,4.7 72.2,16.7 84.6,15.4 83.3,27.8 95.3,31.2 89.2,42.2 ' +
  '99.0,50.0 89.2,57.8 95.3,68.8 83.3,72.2 84.6,84.6 72.2,83.3 68.8,95.3 57.8,89.2 ' +
  '50.0,99.0 42.2,89.2 31.2,95.3 27.8,83.3 15.4,84.6 16.7,72.2 4.7,68.8 10.8,57.8 ' +
  '1.0,50.0 10.8,42.2 4.7,31.2 16.7,27.8 15.4,15.4 27.8,16.7 31.2,4.7 42.2,10.8'

interface HomeHeroProps {
  typeCode: TypeCode | null
}

export default function HomeHero({ typeCode }: HomeHeroProps) {
  const cta = typeCode
    ? { href: `/result/${typeCode}`, label: '내 유형 카드 보기' }
    : { href: '/test', label: '독서유형 테스트 시작하기' }
  const count = TEST_PARTICIPANT_COUNT.toLocaleString('ko-KR')

  return (
    <section className="bj-hero bj-hero--with-burst" style={{ marginTop: 'var(--space-xs)' }}>
      <div className="bj-hero__illust">
        <IllustPlaceholder code="intro_test" alt="독서 유형 테스트" aspectRatio="1 / 1" fit="contain" background="transparent" />
      </div>
      <div className="bj-hero__body">
        <h1 className="bj-hero__title" style={{ margin: 0 }}>나의 독서 유형은 무엇일까?</h1>
        <p className="bj-hero__sub" style={{ margin: 0 }}>12문항으로 16가지 독서 유형을 진단해보세요!</p>
        <Link
          href={cta.href}
          className="bj-btn bj-btn--primary"
          style={{ marginTop: 'var(--space-lg)' }}
        >
          {cta.label}
          <ArrowRightIcon />
        </Link>
        <p className="bj-hero__count" style={{ margin: 'var(--space-sm) 0 0' }}>
          지금까지 <b>{count}명</b> 참여했어요
        </p>
      </div>
      <div className="bj-hero__burst" aria-hidden="true">
        <svg className="bj-hero__burst-shape" viewBox="0 0 100 100">
          <polygon points={STARBURST_POINTS} />
        </svg>
        <span className="bj-hero__burst-label">
          지금까지
          <b>{count}명</b>
          참여했어요!
        </span>
      </div>
    </section>
  )
}
