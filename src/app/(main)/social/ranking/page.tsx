'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MOCK_PEOPLE } from '@/data/people'
import { READING_TYPES } from '@/data/readingTypes'
import { loadResult } from '@/lib/scoring'
import { getActivityScore, getActivitySummary, ACTIVITY_LABELS, type ActivityType } from '@/lib/activity'
import { getNickname } from '@/lib/profile'
import { ME_ID } from '@/lib/author'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

export default function RankingPage() {
  const [myScore, setMyScore] = useState(0)
  const [mySummary, setMySummary] = useState<Record<ActivityType, number> | null>(null)
  const [myTypeCode, setMyTypeCode] = useState<ReturnType<typeof loadResult>>(null)
  const [myNickname, setMyNickname] = useState('나')

  useEffect(() => {
    setMyScore(getActivityScore())
    setMySummary(getActivitySummary())
    setMyTypeCode(loadResult())
    setMyNickname(getNickname() ?? '나')
  }, [])

  const ranked = useMemo(() => {
    const others = MOCK_PEOPLE.map((p) => ({ id: p.id, nickname: p.nickname, typeCode: p.typeCode, score: p.score, isMe: false }))
    const me = { id: ME_ID, nickname: myNickname, typeCode: myTypeCode?.typeCode ?? null, score: myScore, isMe: true }
    return [...others, me].sort((a, b) => b.score - a.score)
  }, [myScore, myTypeCode, myNickname])

  const summaryEntries = mySummary
    ? (Object.entries(mySummary) as [ActivityType, number][]).filter(([, count]) => count > 0)
    : []

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">독서 랭킹</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bj-card--flat">
          <p className="bj-body" style={{ fontWeight: 600, marginBottom: 6 }}>내 활동 내역 · {myScore}점</p>
          {summaryEntries.length > 0 ? (
            <p className="bj-caption">
              {summaryEntries.map(([type, count]) => `${ACTIVITY_LABELS[type]} ${count}번`).join(' · ')}
            </p>
          ) : (
            <p className="bj-caption">책 읽고 평가하고 질문 남기면 점수가 쌓여요</p>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {ranked.map((entry, i) => {
            const type = entry.typeCode ? READING_TYPES[entry.typeCode] : null
            return (
              <div
                key={entry.id}
                className="bj-row"
                style={entry.isMe ? { background: 'var(--color-action-tint)' } : undefined}
              >
                <p className="bj-display bj-display--lg" style={{ fontSize: 18, width: 28, flexShrink: 0, color: i < 3 ? 'var(--color-action)' : 'var(--color-text-hint)' }}>
                  {i + 1}
                </p>
                {type ? (
                  <div style={{ width: 40, flexShrink: 0 }}>
                    <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                  </div>
                ) : (
                  <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 'var(--radius-control)', background: 'var(--color-bg-sunken)' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bj-body" style={{ fontWeight: 700, fontSize: 14 }}>
                    {entry.nickname}{entry.isMe && ' (나)'}
                  </p>
                  <p className="bj-caption">{type ? type.name : '유형 미진단'}</p>
                </div>
                <p className="bj-body" style={{ fontWeight: 700, fontSize: 15, color: entry.isMe ? 'var(--color-action-on-tint)' : undefined }}>
                  {entry.score}점
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
