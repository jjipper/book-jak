'use client'

import { useEffect, useState } from 'react'
import { loadRanking, type RankingEntry } from '@/entities/person/api/personRemote'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import BackLink from '@/shared/ui/BackLink'

// 점수 산식은 Postgres 뷰(reading_ranking, supabase/migrations/0002_track_b.sql)에 있다.
// 여기서는 그 집계를 그대로 보여주기만 한다.
const BREAKDOWN: { key: keyof RankingEntry; label: string }[] = [
  { key: 'ratingsCount', label: '책 평가' },
  { key: 'reviewsCount', label: '한 줄 리뷰' },
  { key: 'postsCount', label: '글 작성' },
  { key: 'questionsCount', label: '질문 작성' },
  { key: 'answersCount', label: '답변 작성' },
  { key: 'clubsCreated', label: '모임 개설' },
  { key: 'clubsJoined', label: '모임 참여' },
]

export default function SocialRankingView() {
  const [ranked, setRanked] = useState<RankingEntry[]>([])
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

  const me = myId ? ranked.find((r) => r.userId === myId) : undefined
  const summaryEntries = me ? BREAKDOWN.filter(({ key }) => (me[key] as number) > 0) : []

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/social" />
        <span className="bj-h2">독서 랭킹</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-card--flat">
          <p className="bj-body bj-semibold bj-mb-6">내 활동 내역 · {me?.score ?? 0}점</p>
          {summaryEntries.length > 0 ? (
            <p className="bj-caption">
              {summaryEntries.map(({ key, label }) => `${label} ${me![key]}번`).join(' · ')}
            </p>
          ) : (
            <p className="bj-caption">책 읽고 평가하고 질문 남기면 점수가 쌓여요</p>
          )}
        </div>

        {ranked.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 랭킹이 없어요</p>
            <p className="bj-caption">첫 활동을 남기면 여기에 이름이 올라가요</p>
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
                    <p className="bj-body bj-bold bj-discuss-text">
                      {entry.nickname}{isMe && ' (나)'}
                    </p>
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
