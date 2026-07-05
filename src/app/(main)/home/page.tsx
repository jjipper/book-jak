'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { loadResult } from '@/lib/scoring'
import { READING_TYPES } from '@/data/readingTypes'
import RarityBadge from '@/components/ui/RarityBadge'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

const PREVIEW_CODES = ['FIEW', 'TIGR', 'TCGW', 'FIER', 'TCEW', 'FIGW'] as const

export default function HomePage() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)

  useEffect(() => { setSavedResult(loadResult()) }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

  return (
    <main style={{ minHeight: '100dvh' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span className="bj-riso" style={{ width: 26, height: 26 }}>
            <span className="bj-riso__a" style={{ width: 26, height: 26, background: 'var(--color-action)' }} />
            <span className="bj-riso__b" style={{ width: 26, height: 26, background: 'var(--p-riso-blue)' }} />
          </span>
          <span className="bj-display bj-display--lg">북작</span>
        </Link>
        <button className="bj-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </header>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* 독서유형 테스트 진입 버튼 */}
        <Link href="/test" className="bj-btn bj-btn--primary bj-btn--block" style={{ padding: '16px 0', fontSize: 16 }}>
          독서유형 테스트
        </Link>

        {/* 내 유형 카드 (테스트 완료 시) */}
        {myType && (
          <Link href={`/result/${savedResult!.typeCode}`} style={{ textDecoration: 'none' }}>
            <div className="bj-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 64, flexShrink: 0 }}>
                <IllustPlaceholder code={myType.code} alt={myType.name} aspectRatio="1 / 1" />
              </div>
              <div>
                <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{myType.code}</p>
                <p className="bj-display bj-display--lg">{myType.name}</p>
                <p className="bj-caption" style={{ marginTop: 4 }}>내 결과 보기 →</p>
              </div>
            </div>
          </Link>
        )}

        {/* Coming Soon */}
        <div className="bj-card">
          <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', marginBottom: 14 }}>
            곧 오픈
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { title: '블라인드 책 추천', desc: '제목 숨기고 경험으로 고르는 책' },
              { title: '취향 맞는 사람 찾기', desc: '나와 N% 일치하는 독서 파트너' },
              { title: '책 모임 만들기', desc: '오프라인 독서 모임 자유롭게' },
            ].map((item) => (
              <div key={item.title} className="bj-row" style={{ opacity: 0.6 }}>
                <div style={{ flex: 1 }}>
                  <p className="bj-body" style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.title}</p>
                  <p className="bj-caption">{item.desc}</p>
                </div>
                <span className="bj-badge bj-badge--common">준비중</span>
              </div>
            ))}
          </div>
        </div>

        {/* 16유형 갤러리 */}
        <div>
          <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.12em', marginBottom: 12 }}>
            16가지 독서 유형 미리보기
          </p>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {PREVIEW_CODES.map((code) => {
              const t = READING_TYPES[code]
              return (
                <div key={code} className="bj-card" style={{ flexShrink: 0, width: 108, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <IllustPlaceholder code={t.code} alt={t.name} aspectRatio="1 / 1" />
                  <span className="bj-caption" style={{ fontWeight: 700 }}>{t.code}</span>
                  <span className="bj-body" style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{t.name}</span>
                  <RarityBadge level={t.rarityLevel} pct={t.rarityPct} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
