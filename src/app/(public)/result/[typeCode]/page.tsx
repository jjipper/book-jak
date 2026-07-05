'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import { useTestStore } from '@/store/testStore'
import { loadResult } from '@/lib/scoring'
import { READING_TYPES, type TypeCode } from '@/data/readingTypes'
import TypeCard from '@/components/result/TypeCard'

interface ResultPageProps {
  params: Promise<{ typeCode: string }>
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 700,
  letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'var(--color-action)', marginBottom: 14,
  display: 'flex', alignItems: 'center', gap: 8,
}

export default function ResultPage({ params }: ResultPageProps) {
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
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '48px 20px 16px' }}>
        <Link href="/home" className="bj-display bj-display--lg" style={{ textDecoration: 'none' }}>
          북작
        </Link>
        <Link href="/test" className="bj-btn" style={{ padding: '8px 14px', fontSize: 12 }}>
          다시 하기
        </Link>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

        {/* 공유 링크 유입 안내 */}
        {showTestPrompt && (
          <div className="bj-card--flat" style={{ width: '100%', textAlign: 'center' }}>
            <p className="bj-body" style={{ color: 'var(--color-text-muted)', marginBottom: 12 }}>
              친구가 공유한 카드예요.<br />나의 유형은 뭘까요?
            </p>
            <Link href="/test" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              나도 테스트해보기 →
            </Link>
          </div>
        )}

        {/* 결과 카드 */}
        <div style={{ width: '100%' }}>
          <TypeCard
            typeCode={typeCode}
            result={result ?? { typeCode, axisScores: { FT: { F: 2, T: 1 }, IC: { I: 2, C: 1 }, EG: { E: 2, G: 1 }, RW: { R: 2, W: 1 } }, variantStats: type.baseStats, badgeCandidates: [] }}
            shareRef={cardRef}
          />
        </div>

        {/* 버튼들 */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleSaveImage} disabled={saving}
            className="bj-btn bj-btn--primary bj-btn--block"
            style={{ padding: '16px 0', fontSize: 16, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? '이미지 저장 중...' : '이미지로 저장하기'}
          </button>

          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="bj-btn bj-btn--block"
            style={{ padding: '16px 0', fontSize: 16 }}
          >
            테스트 링크 공유하기
          </button>

          {showShareMenu && (
            <div className="bj-card--flat" style={{ padding: 0, overflow: 'hidden' }}>
              <button onClick={handleCopyLink} className="bj-row" style={{ width: '100%', borderRadius: 0, textAlign: 'left', border: 'none', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                <span className="bj-body" style={{ fontWeight: 500 }}>링크 복사</span>
              </button>
              <button onClick={() => { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`나의 독서 유형은 "${type.name}"이래! 너도 해봐`)}&url=${encodeURIComponent(window.location.origin + '/test')}`, '_blank'); setShowShareMenu(false) }}
                className="bj-row" style={{ width: '100%', borderRadius: 0, textAlign: 'left', border: 'none', cursor: 'pointer' }}>
                <span className="bj-body" style={{ fontWeight: 500 }}>트위터에 공유</span>
              </button>
            </div>
          )}

          <button
            onClick={() => setShowFullReport(!showFullReport)}
            className="bj-btn bj-btn--ghost bj-btn--block"
            style={{ padding: '16px 0', fontSize: 16 }}
          >
            {showFullReport ? '접기 ↑' : '풀 리포트 보기 ↓'}
          </button>
        </div>

        {/* 궁합 카드 (요약) */}
        <div className="bj-card--flat" style={{ width: '100%' }}>
          <p className="bj-body" style={{ fontWeight: 600, marginBottom: 4 }}>
            {type.compatibility.matchName}이(가) 최고의 독서 파트너래요
          </p>
          <p className="bj-caption" style={{ marginBottom: 12 }}>
            "{type.compatibility.matchLine}"
          </p>
          <Link href="/result/compare" style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-action)', textDecoration: 'none' }}>
            친구와 궁합 비교하기 →
          </Link>
        </div>

        {/* 풀 리포트 (토글) */}
        {showFullReport && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* 어록 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>입에 달고 사는 말<span className="bj-section-label__line" /></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {type.quote.map((q, i) => (
                  <div key={i} className="bj-callout">{q}</div>
                ))}
              </div>
            </div>

            {/* 궁합 상세 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>독서 궁합<span className="bj-section-label__line" /></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="bj-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <p className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>환상의 짝</p>
                  <p className="bj-body" style={{ fontWeight: 600 }}>{type.compatibility.matchName}</p>
                  <p className="bj-caption" style={{ fontStyle: 'italic' }}>"{type.compatibility.matchLine}"</p>
                </div>
                <div className="bj-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                  <p className="bj-caption" style={{ fontWeight: 700 }}>상극</p>
                  <p className="bj-body" style={{ fontWeight: 600 }}>{type.compatibility.oppName}</p>
                  <p className="bj-caption" style={{ fontStyle: 'italic' }}>"{type.compatibility.oppLine}"</p>
                </div>
              </div>
              <Link href="/result/compare" className="bj-btn bj-btn--ghost bj-btn--block" style={{ marginTop: 14 }}>
                친구와 궁합 비교하기 →
              </Link>
            </div>

            {/* 칭호 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>획득 가능 칭호<span className="bj-section-label__line" /></p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {type.titles.map((title, i) => (
                  <div key={i} className="bj-row">
                    <p className="bj-body" style={{ margin: 0, fontSize: 13 }}>
                      {title.slice(title.indexOf(' ') + 1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 취급주의 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>취급주의<span className="bj-section-label__line" /></p>
              <div className="bj-callout bj-callout--muted" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-action)', flexShrink: 0 }}>경고</span>
                  <p style={{ margin: 0 }}>{type.warning.alert}</p>
                </div>
                <div style={{ height: 1, background: 'var(--color-border)' }} />
                <div style={{ display: 'flex', gap: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-action)', flexShrink: 0 }}>부작용</span>
                  <p style={{ margin: 0 }}>{type.warning.sideEffect}</p>
                </div>
              </div>
            </div>

            {/* 독서 운세 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>독서 운세<span className="bj-section-label__line" /></p>
              <p className="bj-body" style={{ marginBottom: 14 }}>{type.fortune.text}</p>
              <div className="bj-callout">처방: {type.fortune.prescription}</div>
            </div>

            {/* 1년 후 예언 */}
            <div className="bj-card">
              <p style={sectionLabelStyle}>1년 후 예언<span className="bj-section-label__line" /></p>
              <div className="bj-card--flat" style={{ textAlign: 'center' }}>
                <p className="bj-body" style={{ margin: 0 }}>{type.prophecy}</p>
              </div>
            </div>

            <button
              onClick={() => setShowFullReport(false)}
              className="bj-btn bj-btn--block"
              style={{ padding: '16px 0', fontSize: 15 }}
            >
              접기 ↑
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
