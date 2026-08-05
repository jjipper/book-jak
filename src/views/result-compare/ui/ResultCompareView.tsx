'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { toast } from '@/shared/lib/toast'
import { READING_TYPES, type TypeCode, TYPE_CODES } from '@/entities/reading-type/model/readingTypes'
import { useTestStore } from '@/features/quiz-test/model/testStore'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { calcAffinity, affinityLabel } from '@/entities/reading-type/model/affinity'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function ResultCompareView() {
  return (
    <Suspense fallback={null}>
      <CompareContent />
    </Suspense>
  )
}

function CompareContent() {
  const { result: storeResult } = useTestStore()
  const myResult = storeResult ?? loadResult()
  const myTypeCode = myResult?.typeCode

  const searchParams = useSearchParams()
  const presetType = searchParams.get('type')
  const initialFriend = presetType && TYPE_CODES.includes(presetType as TypeCode) ? (presetType as TypeCode) : null

  const [friendType, setFriendType] = useState<TypeCode | null>(initialFriend)
  const [showPicker, setShowPicker] = useState(false)

  const myType = myTypeCode ? READING_TYPES[myTypeCode] : null
  const friendTypeData = friendType ? READING_TYPES[friendType] : null

  const affinity = myTypeCode && friendType ? calcAffinity(myTypeCode, friendType) : null

  const cardBox = (t: typeof myType): React.ReactNode => {
    if (!t) return null
    return (
      <div className="bj-card bj-col-10 bj-text-center bj-card--p12">
        <IllustPlaceholder code={t.code} alt={t.name} aspectRatio="1 / 1" />
        <p className="bj-caption bj-bold">{t.code}</p>
        <p className="bj-body bj-name-sm">{t.name}</p>
      </div>
    )
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      {/* 헤더 */}
      <header className="bj-subpage-head">
        <Link href={myTypeCode ? `/result/${myTypeCode}` : '/home'} className="bj-icon-btn">←</Link>
        <div>
          <p className="bj-h2">친구 궁합 비교</p>
          <p className="bj-caption bj-mt-2">독서 취향이 얼마나 맞을까?</p>
        </div>
      </header>

      <div className="bj-content--lg">

        {/* 나 vs 친구 */}
        <div className="bj-row-center">
          {/* 내 카드 */}
          <div className="bj-flex-1">
            <p className="bj-caption bj-bold bj-text-center bj-mb-8">나</p>
            {myType
              ? cardBox(myType)
              : <Link href="/test" className="bj-card--flat bj-unstyled-link bj-text-center bj-block">
                  <p className="bj-pick-placeholder">?</p>
                  <p className="bj-caption">테스트 먼저!</p>
                </Link>
            }
          </div>

          {/* 가운데 */}
          <div className="bj-compare-mid bj-text-center">
            {affinity !== null
              ? <>
                  <p className="bj-caption bj-bold bj-mb-4">취향 일치</p>
                  <p className="bj-display bj-display--lg bj-affinity-lg">{affinity}%</p>
                </>
              : <p className="bj-display bj-display--lg bj-vs-text">VS</p>
            }
          </div>

          {/* 친구 카드 */}
          <div className="bj-flex-1">
            <p className="bj-caption bj-bold bj-text-center bj-mb-8">친구</p>
            {friendTypeData
              ? cardBox(friendTypeData)
              : <button onClick={() => setShowPicker(true)} className="bj-card--flat bj-friend-pick-btn">
                  <p className="bj-pick-placeholder">+</p>
                  <p className="bj-caption">친구 유형 선택</p>
                </button>
            }
          </div>
        </div>

        {/* 궁합 결과 */}
        {affinity !== null && myType && friendTypeData && (
          <div className="bj-card">
            <div className="bj-affinity-result-head">
              <p className="bj-display bj-display--xl bj-affinity-xl">{affinity}%</p>
              <p className="bj-body bj-semibold">{affinityLabel(affinity)}</p>
            </div>
            <div className="bj-progress__track bj-progress--affinity">
              <div className="bj-progress__fill" style={{ width: `${affinity}%`, transition: 'width 1s ease' }} />
            </div>
            {myType.compatibility.match === friendType && (
              <div className="bj-callout bj-text-center">
                <p className="bj-callout-title">환상의 조합!</p>
                <p className="bj-caption bj-caption--inherit">&ldquo;{myType.compatibility.matchLine}&rdquo;</p>
              </div>
            )}
            {myType.compatibility.opposite === friendType && (
              <div className="bj-callout bj-callout--muted bj-text-center">
                <p className="bj-callout-title">완전 상극!</p>
                <p className="bj-caption">&ldquo;{myType.compatibility.oppLine}&rdquo;</p>
              </div>
            )}
          </div>
        )}

        {/* 친구 바꾸기 */}
        {friendType && (
          <button onClick={() => { setFriendType(null); setShowPicker(true) }} className="bj-btn bj-btn--block">
            친구 유형 바꾸기
          </button>
        )}

        {/* 링크 공유 유도 */}
        <div className="bj-card--flat bj-text-center">
          <p className="bj-body bj-text-muted bj-mb-12">
            친구한테 테스트 링크를 보내고<br />결과를 직접 넣어보세요
          </p>
          <button onClick={async () => { await navigator.clipboard.writeText(`${window.location.origin}/test`); toast.show('테스트 링크 복사됐어요!') }} className="bj-btn bj-btn--ghost">
            테스트 링크 복사하기
          </button>
        </div>
      </div>

      {/* 유형 피커 모달 */}
      {showPicker && (
        <div className="bj-sheet__overlay" onClick={() => setShowPicker(false)}>
          <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bj-row-between bj-mb-16">
              <p className="bj-h2">친구 유형 선택</p>
              <button onClick={() => setShowPicker(false)} className="bj-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="bj-grid-2-sheet">
              {TYPE_CODES.map((code) => {
                const t = READING_TYPES[code]
                const isSelected = friendType === code
                return (
                  <button
                    key={code}
                    onClick={() => { setFriendType(code); setShowPicker(false) }}
                    className={`bj-choice bj-picker-inner${isSelected ? ' is-active' : ''}`}
                  >
                    <div className="bj-min-w-0">
                      <p className="bj-caption bj-bold bj-mb-2">{code}</p>
                      <p className="bj-name-sm">{t.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
      </div>
    </main>
  )
}
