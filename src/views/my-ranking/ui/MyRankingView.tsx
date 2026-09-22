'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadRanking, type RankingEntry } from '@/entities/person/api/personRemote'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import BackLink from '@/shared/ui/BackLink'

// 점수 산식은 Postgres 뷰(reading_ranking_weekly, supabase/migrations/0011_drop_discussion_weekly_ranking.sql)에 있다.
// 여기서는 그 집계를 그대로 보여주기만 한다.
const BREAKDOWN: { key: keyof RankingEntry; label: string }[] = [
  { key: 'ratingsCount', label: '책 평가' },
  { key: 'reviewsCount', label: '한 줄 리뷰' },
  { key: 'postsCount', label: '글 작성' },
  { key: 'clubsCreated', label: '모임 개설' },
  { key: 'clubsJoined', label: '모임 참여' },
]

export default function MyRankingView() {
  const [ranked, setRanked] = useState<RankingEntry[] | null>(null)
  const [myId, setMyId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const sb = createSupabaseBrowser()
      const [{ data: { user } }, rows] = await Promise.all([sb.auth.getUser(), loadRanking()])
      setMyId(user?.id ?? null)
      setRanked(rows)
    }
    void load()
  }, [])

  const me = myId ? ranked?.find((r) => r.userId === myId) : undefined
  // 가입자가 나뿐이면 "1위"가 민망하므로 순위 대신 안내를 띄운다.
  const onlyMe = ranked !== null && ranked.length === 1 && ranked[0].userId === myId
  const summaryEntries = me ? BREAKDOWN.filter(({ key }) => (me[key] as number) > 0) : []

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">이번 주 독서 랭킹</span>
      </header>

      <div className="bj-content--lg">
        {ranked !== null && (
          <div className="bj-card--flat">
            <p className="bj-body bj-semibold bj-mb-6">이번 주 내 활동 · {me?.score ?? 0}점</p>
            {summaryEntries.length > 0 ? (
              <p className="bj-caption">
                {summaryEntries.map(({ key, label }) => `${label} ${me![key]}번`).join(' · ')}
              </p>
            ) : (
              <p className="bj-caption">월요일마다 새로 시작해요. 책을 평가하고 글을 쓰면 점수가 쌓여요</p>
            )}
          </div>
        )}

        {ranked === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : ranked.length === 0 || onlyMe ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">이번 주 순위를 겨룰 사람이 아직 없어요</p>
            <p className="bj-caption bj-mb-16">먼저 점수를 쌓아두면<br />사람들이 들어올 때 위에서 기다릴 수 있어요</p>
            <Link href="/rate" className="bj-btn bj-btn--primary bj-btn--cta">
              읽은 책 평가하러 가기
            </Link>
          </div>
        ) : (
          <div className="bj-col-10">
            {ranked.map((entry, i) => {
              const isMe = entry.userId === myId
              const type = entry.typeCode ? READING_TYPES[entry.typeCode as TypeCode] : null
              return (
                <div
                  key={entry.userId}
                  className={`bj-row${isMe ? ' bj-row--me' : ''}`}
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
                    <Link href={`/people/${entry.userId}`} className="bj-body bj-bold bj-discuss-text bj-unstyled-link">
                      {entry.nickname}{isMe && ' (나)'}
                    </Link>
                    <p className="bj-caption">{type ? type.name : '유형 미진단'}</p>
                  </div>
                  <p className={`bj-body bj-bold bj-rank-score${isMe ? ' bj-rank-score--me' : ''}`}>
                    {entry.score}점
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
      </div>
    </main>
  )
}
