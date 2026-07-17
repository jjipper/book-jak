'use client'

import { useEffect, useState } from 'react'
import { loadResult } from '@/lib/scoring'
import { pickDailyBooks, dateKeyOf } from '@/lib/dailyDiscover'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/lib/discussions'
import { loadClubs } from '@/lib/clubs'
import { getMatchedPeople, type MatchedPerson } from '@/lib/peopleMatch'
import type { BlindBook } from '@/data/blindBooks'
import type { BookClub } from '@/data/clubs'
import HomeTopbar from '@/components/home/HomeTopbar'
import HomeHero from '@/components/home/HomeHero'
import DiscoverRail from '@/components/home/DiscoverRail'
import DiscussSection from '@/components/home/DiscussSection'
import FriendRail from '@/components/home/FriendRail'
import ClubRail from '@/components/home/ClubRail'
import TypeRail from '@/components/home/TypeRail'
import HomeFooter from '@/components/home/HomeFooter'

export default function HomePage() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [dateKey, setDateKey] = useState('')
  const [dailyBooks, setDailyBooks] = useState<BlindBook[]>([])
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({})
  const [matches, setMatches] = useState<MatchedPerson[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])

  // localStorage 기반 데이터라 마운트 후 로드 (SSR 불일치 방지 — 기존 홈과 동일 패턴)
  useEffect(() => {
    const key = dateKeyOf(new Date())
    setSavedResult(loadResult())
    setDateKey(key)
    setDailyBooks(pickDailyBooks(key))

    const hot = [...loadQuestions()]
      .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
      .slice(0, 3)
    setQuestions(hot)
    setAnswerCounts(Object.fromEntries(hot.map((q) => [q.id, loadAnswers(q.id).length])))

    setMatches(getMatchedPeople().slice(0, 4))
    setClubs(loadClubs().slice(0, 4))
  }, [])

  return (
    <main className="bj-shell" style={{ minHeight: '100dvh' }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
        <HomeTopbar typeCode={savedResult?.typeCode ?? null} />
        <HomeHero typeCode={savedResult?.typeCode ?? null} />
        {dailyBooks.length > 0 && <DiscoverRail books={dailyBooks} dateKey={dateKey} />}
        {questions.length > 0 && <DiscussSection questions={questions} answerCounts={answerCounts} />}
        {clubs.length > 0 && <ClubRail clubs={clubs} />}
        {matches.length > 0 && <FriendRail matches={matches} />}
        <TypeRail />
        <HomeFooter />
      </div>
    </main>
  )
}
