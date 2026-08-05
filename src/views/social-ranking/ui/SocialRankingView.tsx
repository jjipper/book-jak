'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { MOCK_PEOPLE } from '@/entities/person/model/people'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { getActivityScore, getActivitySummary, ACTIVITY_LABELS, type ActivityType } from '@/shared/lib/activity'
import { getNickname } from '@/entities/user/model/profile'
import { ME_ID } from '@/features/resolve-author/model/author'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

// TODO: 랭킹 서버 연동
//   - MOCK_PEOPLE 점수 → sb.from('profiles').select('id, nickname, activity_score, type_code') 로 교체
//   - 내 점수는 activity_score 컬럼에 upsert (현재는 localStorage getActivityScore()만 사용)
//   - 기간별 랭킹(주간/월간/전체) 필터 추가 고려
export default function SocialRankingView() {
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
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">독서 랭킹</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-card--flat">
          <p className="bj-body bj-semibold bj-mb-6">내 활동 내역 · {myScore}점</p>
          {summaryEntries.length > 0 ? (
            <p className="bj-caption">
              {summaryEntries.map(([type, count]) => `${ACTIVITY_LABELS[type]} ${count}번`).join(' · ')}
            </p>
          ) : (
            <p className="bj-caption">책 읽고 평가하고 질문 남기면 점수가 쌓여요</p>
          )}
        </div>

        <div className="bj-col-10">
          {ranked.map((entry, i) => {
            const type = entry.typeCode ? READING_TYPES[entry.typeCode] : null
            return (
              <div
                key={entry.id}
                className={`bj-row${entry.isMe ? ' bj-row--me' : ''}`}
              >
                <p className={`bj-display bj-display--lg bj-rank-num${i < 3 ? ' bj-rank-num--top' : ' bj-rank-num--rest'}`}>
                  {i + 1}
                </p>
                {type ? (
                  <div className="bj-rank-avatar">
                    <IllustPlaceholder code={type.code} alt={type.name} aspectRatio="1 / 1" />
                  </div>
                ) : (
                  <div className="bj-rank-avatar bj-rank-avatar--empty" />
                )}
                <div className="bj-flex-1">
                  <p className="bj-body bj-bold bj-discuss-text">
                    {entry.nickname}{entry.isMe && ' (나)'}
                  </p>
                  <p className="bj-caption">{type ? type.name : '유형 미진단'}</p>
                </div>
                <p className={`bj-body bj-bold bj-rank-score${entry.isMe ? ' bj-rank-score--me' : ''}`}>
                  {entry.score}점
                </p>
              </div>
            )
          })}
        </div>
      </div>
      </div>
    </main>
  )
}
