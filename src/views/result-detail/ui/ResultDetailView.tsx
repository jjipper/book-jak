'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import { useTestStore } from '@/features/quiz-test/model/testStore'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import TypeCard from '@/entities/reading-type/ui/TypeCard'

interface ResultDetailViewProps {
  params: Promise<{ typeCode: string }>
}

function SectionLabelInline({ children }: { children: React.ReactNode }) {
  return (
    <p className="bj-section-label--inline">
      {children}
    </p>
  )
}

export default function ResultDetailView({ params }: ResultDetailViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { result: storeResult } = useTestStore()
  const [typeCode, setTypeCode] = useState<TypeCode | null>(null)
  const [result, setResult] = useState(storeResult)
  const [saving, setSaving] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [showFullReport, setShowFullReport] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(({ typeCode: code }) => {
      if (!READING_TYPES[code as TypeCode]) { router.replace('/home'); return }
      setTypeCode(code as TypeCode)
    })
  }, [params, router])

  useEffect(() => {
    if (!result) { const s = loadResult(); if (s) setResult(s) }
  }, [result])

  useEffect(() => {
    if (searchParams.get('full') === '1') setShowFullReport(true)
  }, [searchParams])

  if (!typeCode) return null
  const type = READING_TYPES[typeCode]

  async function handleSaveImage() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, backgroundColor: '#ffffff', pixelRatio: 2 })
      const a = document.createElement('a'); a.download = `BOOKJAK_${typeCode}.png`; a.href = dataUrl; a.click()
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/test`
    try { await navigator.clipboard.writeText(url); alert('테스트 링크 복사됐어요! 친구에게 공유해보세요') }
    catch { prompt('링크를 복사하세요:', url) }
    setShowShareMenu(false)
  }

  const showTestPrompt = !result

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      {/* 헤더 */}
      <header className="bj-subpage-head--between">
        <Link href="/home" className="bj-display bj-display--lg">
          북작
        </Link>
        <Link href="/test" className="bj-btn bj-btn--sm">
          다시 하기
        </Link>
      </header>

      <div className="bj-content--center-20">

        {/* 공유 링크 유입 안내 */}
        {showTestPrompt && (
          <div className="bj-card--flat bj-text-center bj-w-full">
            <p className="bj-body bj-text-muted bj-mb-12">
              친구가 공유한 카드예요.<br />나의 유형은 뭘까요?
            </p>
            <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta">
              나도 테스트해보기 →
            </Link>
          </div>
        )}

        {/* 결과 카드 */}
        <div className="bj-w-full">
          <TypeCard
            typeCode={typeCode}
            result={result ?? { typeCode, axisScores: { FT: { F: 2, T: 1 }, IC: { I: 2, C: 1 }, EG: { E: 2, G: 1 }, RW: { R: 2, W: 1 } }, variantStats: type.baseStats, badgeCandidates: [] }}
            shareRef={cardRef}
          />
        </div>

        {/* 버튼들 */}
        <div className="bj-col-10 bj-w-full">
          <button
            onClick={handleSaveImage} disabled={saving}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--action-lg"
            style={{ opacity: saving ? 0.7 : 1 }}
          >
            {saving ? '이미지 저장 중...' : '이미지로 저장하기'}
          </button>

          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="bj-btn bj-btn--block bj-btn--action-lg"
          >
            테스트 링크 공유하기
          </button>

          {showShareMenu && (
            <div className="bj-card--flat bj-card--no-pad">
              <button onClick={handleCopyLink} className="bj-row bj-share-btn bj-share-btn--border-bottom">
                <span className="bj-body bj-semibold">링크 복사</span>
              </button>
              <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`나의 독서 유형은 "${type.name}"이래! 너도 해봐`)}&url=${encodeURIComponent(window.location.origin + '/test')}`, '_blank'); setShowShareMenu(false) }}
                className="bj-row bj-share-btn">
                <span className="bj-body bj-semibold">트위터에 공유</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFullReport(!showFullReport)}
            className="bj-btn bj-btn--ghost bj-btn--block bj-btn--action-lg"
          >
            {showFullReport ? '접기 ↑' : '풀 리포트 보기 ↓'}
          </button>
        </div>

        {/* 궁합 카드 (요약) */}
        <div className="bj-card--flat bj-w-full">
          <p className="bj-body bj-semibold bj-mb-4">
            {type.compatibility.matchName}이(가) 최고의 독서 파트너래요
          </p>
          <p className="bj-caption bj-mb-12">
            &ldquo;{type.compatibility.matchLine}&rdquo;
          </p>
          <Link href="/result/compare" className="bj-unstyled-link bj-text-11 bj-text-action-bold">
            친구와 궁합 비교하기 →
          </Link>
        </div>

        {/* 풀 리포트 (토글) */}
        {showFullReport && (
          <div className="bj-col-12 bj-w-full">

            {/* 어록 */}
            <div className="bj-card">
              <SectionLabelInline>입에 달고 사는 말<span className="bj-section-label__line" /></SectionLabelInline>
              <div className="bj-col-10">
                {type.quote.map((q, i) => (
                  <div key={i} className="bj-callout">{q}</div>
                ))}
              </div>
            </div>

            {/* 궁합 상세 */}
            <div className="bj-card">
              <SectionLabelInline>독서 궁합<span className="bj-section-label__line" /></SectionLabelInline>
              <div className="bj-col-10">
                <div className="bj-row bj-row--col">
                  <p className="bj-caption bj-bold bj-text-action">환상의 짝</p>
                  <p className="bj-body bj-semibold">{type.compatibility.matchName}</p>
                  <p className="bj-caption bj-italic">&ldquo;{type.compatibility.matchLine}&rdquo;</p>
                </div>
                <div className="bj-row bj-row--col">
                  <p className="bj-caption bj-bold">상극</p>
                  <p className="bj-body bj-semibold">{type.compatibility.oppName}</p>
                  <p className="bj-caption bj-italic">&ldquo;{type.compatibility.oppLine}&rdquo;</p>
                </div>
              </div>
              <Link href="/result/compare" className="bj-btn bj-btn--ghost bj-btn--block bj-mt-14">
                친구와 궁합 비교하기 →
              </Link>
            </div>

            {/* 칭호 */}
            <div className="bj-card">
              <SectionLabelInline>획득 가능 칭호<span className="bj-section-label__line" /></SectionLabelInline>
              <div className="bj-col-8">
                {type.titles.map((title, i) => (
                  <div key={i} className="bj-row">
                    <p className="bj-body bj-text-sm">
                      {title.slice(title.indexOf(' ') + 1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 취급주의 */}
            <div className="bj-card">
              <SectionLabelInline>취급주의<span className="bj-section-label__line" /></SectionLabelInline>
              <div className="bj-callout bj-callout--muted bj-col-14">
                <div className="bj-warning-row">
                  <span className="bj-warning-label">경고</span>
                  <p>{type.warning.alert}</p>
                </div>
                <div className="bj-divider" />
                <div className="bj-warning-row">
                  <span className="bj-warning-label">부작용</span>
                  <p>{type.warning.sideEffect}</p>
                </div>
              </div>
            </div>

            {/* 독서 운세 */}
            <div className="bj-card">
              <SectionLabelInline>독서 운세<span className="bj-section-label__line" /></SectionLabelInline>
              <p className="bj-body bj-mb-14">{type.fortune.text}</p>
              <div className="bj-callout">처방: {type.fortune.prescription}</div>
            </div>

            {/* 1년 후 예언 */}
            <div className="bj-card">
              <SectionLabelInline>1년 후 예언<span className="bj-section-label__line" /></SectionLabelInline>
              <div className="bj-card--flat bj-text-center">
                <p className="bj-body">{type.prophecy}</p>
              </div>
            </div>

            <button
              onClick={() => setShowFullReport(false)}
              className="bj-btn bj-btn--block bj-btn--action-md"
            >
              접기 ↑
            </button>
          </div>
        )}
      </div>
      </div>
    </main>
  )
}
