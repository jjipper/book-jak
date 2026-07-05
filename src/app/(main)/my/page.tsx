'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { toPng } from 'html-to-image'
import { loadResult } from '@/lib/scoring'
import { READING_TYPES } from '@/data/readingTypes'
import TypeCard from '@/components/result/TypeCard'

const BADGE_LIST = [
  { key: 'bookmark-prisoner', name: '책갈피 수감자', desc: '읽다 멈추기 반복' },
  { key: 'daydream-reader', name: '몽상 독서가', desc: '읽는 척 딴생각' },
  { key: 'mood-reader', name: '무드 리더', desc: '분위기로 책 고름' },
  { key: 'slow-deep-diver', name: '슬로우 다이버', desc: '한 권에 몇 달' },
  { key: 'knowledge-hunter', name: '지식 수집가', desc: '지식 위주 독서' },
  { key: 'worldbuilder-fan', name: '세계관 팬', desc: '설정집까지 읽음' },
  { key: 'genre-nomad', name: '장르 유목민', desc: '장르 안 가림' },
  { key: 'character-first', name: '캐릭터 퍼스트', desc: '인물이 최우선' },
]

function LockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function MyPage() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [saving, setSaving] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSavedResult(loadResult()) }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

  const unlockedBadges = BADGE_LIST.filter((b) => savedResult?.badgeCandidates?.includes(b.key))
  const lockedBadges = BADGE_LIST.filter((b) => !savedResult?.badgeCandidates?.includes(b.key))

  async function handleSaveImage() {
    if (!cardRef.current) return
    setSaving(true)
    try {
      const dataUrl = await toPng(cardRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 })
      const a = document.createElement('a')
      a.download = `BOOKJAK_${savedResult?.typeCode}.png`
      a.href = dataUrl
      a.click()
    } catch (e) { console.error(e) } finally { setSaving(false) }
  }

  return (
    <main style={{ minHeight: '100dvh' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <span className="bj-display bj-display--lg">마이</span>
        <button className="bj-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div style={{ padding: '0 20px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {myType && savedResult ? (
          <>
            {/* 내 유형 카드 */}
            <TypeCard typeCode={savedResult.typeCode} result={savedResult} shareRef={cardRef} />

            {/* 카드 액션 버튼 */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleSaveImage} disabled={saving}
                className="bj-btn bj-btn--ghost"
                style={{ flex: 1, padding: '14px 0', fontSize: 13, opacity: saving ? 0.7 : 1 }}
              >
                {saving ? '저장 중...' : '카드 저장'}
              </button>
              <Link href={`/result/${savedResult.typeCode}?full=1`} className="bj-btn" style={{ flex: 1, padding: '14px 0', fontSize: 13 }}>
                풀 리포트
              </Link>
            </div>

            {/* 배지 섹션 */}
            <div className="bj-card">
              {/* 섹션 헤더 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>나의 배지</span>
                <span className="bj-section-label__line" />
                <span className="bj-caption">{unlockedBadges.length}/{BADGE_LIST.length}</span>
              </div>

              {/* 해금 배지 */}
              {unlockedBadges.length > 0 ? (
                <div style={{ marginBottom: 16 }}>
                  <p className="bj-caption" style={{ marginBottom: 10 }}>획득함</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {unlockedBadges.map((badge) => (
                      <span key={badge.key} className="bj-badge bj-badge--rare" style={{ justifyContent: 'center', padding: '8px 10px' }}>
                        {badge.name}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <p className="bj-caption">테스트로 배지를 획득해보세요</p>
                </div>
              )}

              {/* 잠긴 배지 */}
              <div>
                <p className="bj-caption" style={{ marginBottom: 10 }}>미획득</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, opacity: 0.4 }}>
                  {lockedBadges.map((badge) => (
                    <div key={badge.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 'var(--radius-control)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--color-bg-sunken)', color: 'var(--color-text-hint)',
                      }}>
                        <LockIcon />
                      </div>
                      <p className="bj-caption" style={{ textAlign: 'center', fontSize: 10, lineHeight: 1.3 }}>{badge.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 다시 테스트 */}
            <Link href="/test" className="bj-btn bj-btn--block" style={{ padding: 16, fontSize: 15 }}>
              다시 테스트하기
            </Link>
          </>
        ) : (
          /* 테스트 전 */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <p className="bj-h1" style={{ marginBottom: 8 }}>
                아직 테스트 전이에요
              </p>
              <p className="bj-body" style={{ color: 'var(--color-text-muted)' }}>나의 독서 유형을 먼저 알아보세요</p>
            </div>
            <Link href="/test" className="bj-btn bj-btn--primary" style={{ padding: '16px 32px', fontSize: 16 }}>
              테스트 시작하기 →
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
