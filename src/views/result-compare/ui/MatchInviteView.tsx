'use client'

// 궁합 초대 랜딩 — 결과 화면 "친구와 궁합 보기"로 공유된 링크가 도착하는 곳.
// 내 결과가 이미 있으면 바로 궁합 비교로, 없으면 친구 유형 카드를 보여주고 테스트로 유도한다.

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import { loadResult } from '@/entities/reading-type/model/scoring'
import TypeCard from '@/entities/reading-type/ui/TypeCard'
import { useMounted } from '@/shared/lib/useMounted'
import { Logo } from '@/shared/ui'

export default function MatchInviteView({ typeCode }: { typeCode: TypeCode }) {
  const router = useRouter()
  const mounted = useMounted()
  const hasResult = mounted && !!loadResult()
  const type = READING_TYPES[typeCode]

  useEffect(() => {
    if (hasResult) router.replace(`/result/compare?type=${typeCode}`)
  }, [hasResult, router, typeCode])

  // localStorage 확인 전·이동 중에는 그리지 않는다
  if (!mounted || hasResult) return null

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-page-head">
          <Link href="/home" className="bj-unstyled-link">
            <Logo />
          </Link>
        </header>

        <div className="bj-content--center-20">
          <div className="bj-text-center">
            <p className="bj-h1 bj-mb-8">{type.name} 유형 친구가<br />독서 궁합을 보자고 해요</p>
            <p className="bj-body bj-text-muted">12문항 BOOKBTI 테스트를 마치면 바로 궁합이 나와요</p>
          </div>

          <div className="bj-w-full">
            <TypeCard typeCode={typeCode} />
          </div>

          <Link href={`/test?from=${typeCode}`} className="bj-btn bj-btn--primary bj-btn--block bj-btn--action-lg">
            나도 테스트하고 궁합 보기
          </Link>
        </div>
      </div>
    </main>
  )
}
