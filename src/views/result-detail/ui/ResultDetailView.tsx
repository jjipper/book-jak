'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import { toast } from '@/shared/lib/toast'
import { useTestStore } from '@/features/quiz-test/model/testStore'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES, type StatKey, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import TypeCard from '@/entities/reading-type/ui/TypeCard'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { useMounted } from '@/shared/lib/useMounted'
import './ResultDetailView.css'

interface ResultDetailViewProps {
  params: Promise<{ typeCode: string }>
}

const STAT_KEYS: StatKey[] = ['몰입력', '감수성', '완독력', '인내심', '허세력']
const RADAR_R = 80

/** 오각형 i번째 꼭짓점 — 12시 방향에서 시계방향 */
function radarPoint(i: number, r: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / STAT_KEYS.length
  return [r * Math.cos(angle), r * Math.sin(angle)]
}

const radarPolygon = (radii: number[]) => radii.map((r, i) => radarPoint(i, r).join(',')).join(' ')

function StatRadar({ stats }: { stats: Record<StatKey, number> }) {
  return (
    <svg
      viewBox="-135 -130 270 240"
      className="bj-radar"
      role="img"
      aria-label={STAT_KEYS.map((k) => `${k} ${stats[k]}`).join(', ')}
    >
      {[1, 2 / 3, 1 / 3].map((scale) => (
        <polygon key={scale} className="bj-radar__grid" points={radarPolygon(STAT_KEYS.map(() => RADAR_R * scale))} />
      ))}
      {STAT_KEYS.map((key, i) => {
        const [x, y] = radarPoint(i, RADAR_R)
        return <line key={key} className="bj-radar__axis" x1={0} y1={0} x2={x} y2={y} />
      })}
      <polygon
        className="bj-radar__area"
        points={radarPolygon(STAT_KEYS.map((k) => (RADAR_R * Math.min(stats[k], 100)) / 100))}
      />
      {STAT_KEYS.map((key, i) => {
        const [x, y] = radarPoint(i, RADAR_R + 26)
        return (
          <text key={key} x={x} y={y} textAnchor="middle" className="bj-radar__label">
            <tspan x={x} dy="-0.2em">{key}</tspan>
            <tspan x={x} dy="1.25em" className="bj-radar__value">{stats[key]}</tspan>
          </text>
        )
      })}
    </svg>
  )
}

function MatchTile({ label, code, name, line, best = false }: {
  label: string
  code: TypeCode
  name: string
  line: string
  best?: boolean
}) {
  return (
    <div className={`bj-match__tile${best ? ' bj-match__tile--best' : ''}`}>
      <span className="bj-match__label">{label}</span>
      <div className={`bj-match__illust bj-typecard__illust-bg--${code}`}>
        <IllustPlaceholder code={code} alt={name} aspectRatio="1 / 1" fit="contain" background="transparent" />
      </div>
      <p className="bj-match__name">{name}</p>
      <p className="bj-match__line">&ldquo;{line}&rdquo;</p>
    </div>
  )
}

export default function ResultDetailView({ params }: ResultDetailViewProps) {
  const router = useRouter()
  const { result: storeResult } = useTestStore()
  const [typeCode, setTypeCode] = useState<TypeCode | null>(null)
  // 스토어에 없으면 localStorage 폴백 — 마운트 후에만 읽는다
  const mounted = useMounted()
  const result = useMemo(() => storeResult ?? (mounted ? loadResult() : null), [storeResult, mounted])
  const [saving, setSaving] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const captureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    params.then(({ typeCode: code }) => {
      if (!READING_TYPES[code as TypeCode]) { router.replace('/home'); return }
      setTypeCode(code as TypeCode)
    })
  }, [params, router])

  if (!typeCode) return null
  const type = READING_TYPES[typeCode]
  const { compatibility } = type
  // 남의 결과 링크를 볼 땐 내 스탯이 아니라 그 유형 기본 스탯
  const stats = result?.typeCode === typeCode ? result.variantStats : type.baseStats

  async function handleSaveImage() {
    if (!captureRef.current) return
    setSaving(true)
    try {
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        // 저장 이미지는 유형 카드 + 독서 궁합만
        filter: (node) => !(node instanceof HTMLElement && 'noCapture' in node.dataset),
      })
      const a = document.createElement('a'); a.download = `BOOKJAK_${typeCode}.png`; a.href = dataUrl; a.click()
    } catch {
      toast.error('이미지 저장에 실패했어요')
    } finally { setSaving(false) }
  }

  async function handleCopyLink() {
    const url = `${window.location.origin}/test`
    try {
      await navigator.clipboard.writeText(url)
      toast.show('테스트 링크 복사됐어요! 친구에게 공유해보세요')
    } catch {
      toast.error('링크 복사에 실패했어요')
    }
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

        {/* 결과 카드 + 리포트 — data-no-capture가 붙은 섹션은 저장 이미지에서 빠진다 */}
        <div ref={captureRef} className="bj-col-12 bj-w-full">
          <TypeCard typeCode={typeCode} />

          {/* 유형 설명 */}
          <section data-no-capture className="bj-card bj-report">
            <h3 className="bj-h2">어떤 독서가냐면</h3>
            <p className="bj-report__desc">{type.description}</p>
          </section>

          {/* 독서 스탯 */}
          <section data-no-capture className="bj-card bj-report">
            <h3 className="bj-h2">독서 스탯</h3>
            <StatRadar stats={stats} />
          </section>

          {/* 독서 궁합 */}
          <section className="bj-card bj-report">
            <h3 className="bj-h2">독서 궁합</h3>
            <div className="bj-match">
              <MatchTile best label="환상의 짝" code={compatibility.match} name={compatibility.matchName} line={compatibility.matchLine} />
              <MatchTile label="상극" code={compatibility.opposite} name={compatibility.oppName} line={compatibility.oppLine} />
            </div>
            <Link href="/result/compare" data-no-capture className="bj-btn bj-btn--secondary bj-btn--block">
              친구와 궁합 비교하기
            </Link>
          </section>

          {/* 책 읽으며 하는 생각 */}
          <section data-no-capture className="bj-card bj-report">
            <h3 className="bj-h2">책 읽으면서 자주 하는 생각</h3>
            <div className="bj-thoughts">
              {type.thoughts.map((thought) => (
                <p key={thought} className="bj-thought">{thought}</p>
              ))}
              <div className="bj-thoughts__me">
                <IllustPlaceholder code={typeCode} alt={type.name} aspectRatio="1 / 1" fit="contain" background="transparent" />
              </div>
            </div>
          </section>

          {/* 취급주의 */}
          <section data-no-capture className="bj-card bj-report">
            <div className="bj-caution__tape">
              <span className="bj-caution__title">취급주의</span>
            </div>
            <dl className="bj-caution__list">
              <div className="bj-caution__row">
                <dt className="bj-caution__tag">경고</dt>
                <dd>{type.warning.alert}</dd>
              </div>
              <div className="bj-caution__row">
                <dt className="bj-caution__tag">부작용</dt>
                <dd>{type.warning.sideEffect}</dd>
              </div>
            </dl>
          </section>

          {/* 같은 유형이 좋아하는 책 */}
          <section data-no-capture className="bj-card bj-report">
            <h3 className="bj-h2">나랑 같은 유형이 좋아하는 책</h3>
            <ul className="bj-rail bj-book-picks">
              {type.books.map((book) => (
                <li key={book.genre} className="bj-book-pick">
                  <span className="bj-book-pick__cover" aria-hidden="true">{book.emoji}</span>
                  <p className="bj-book-pick__genre">{book.genre}</p>
                  <p className="bj-book-pick__note">{book.note}</p>
                </li>
              ))}
            </ul>
          </section>
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
            className="bj-btn bj-btn--secondary bj-btn--block bj-btn--action-lg"
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
        </div>
      </div>
      </div>
    </main>
  )
}
