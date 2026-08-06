'use client'

import { useEffect, useState } from 'react'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { pickDailyBooks, dateKeyOf } from '@/entities/blind-book/model/dailyDiscover'
import { loadQuestions, loadAnswers, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
import { loadClubs } from '@/entities/club/model/clubActions'
import { getMatchedPeople, type MatchedPerson } from '@/features/people-match/model/peopleMatch'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'
import type { BookClub } from '@/entities/club/model/clubs'
import HomeTopbar from './HomeTopbar'
import HomeHero from './HomeHero'
import DiscoverRail from './DiscoverRail'
import DiscussSection from './DiscussSection'
import FriendRail from './FriendRail'
import ClubRail from './ClubRail'
import TypeRail from './TypeRail'
import HomeFooter from './HomeFooter'

export default function HomeView() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [dateKey, setDateKey] = useState('')
  const [dailyBooks, setDailyBooks] = useState<BlindBook[]>([])
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [answerCounts, setAnswerCounts] = useState<Record<string, number>>({})
  const [matches, setMatches] = useState<MatchedPerson[]>([])
  const [clubs, setClubs] = useState<BookClub[]>([])

  // localStorage 기반 데이터라 마운트 후 로드 (SSR 불일치 방지 — 기존 홈과 동일 패턴)
  useEffect(() => {
    async function load() {
      const key = dateKeyOf(new Date())
      setSavedResult(loadResult())
      setDateKey(key)
      setDailyBooks(pickDailyBooks(key))

      const allQs = await loadQuestions()
      const hot = [...allQs]
        .sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0))
        .slice(0, 3)
      setQuestions(hot)
      const counts: Record<string, number> = {}
      for (const q of hot) { counts[q.id] = (await loadAnswers(q.id)).length }
      setAnswerCounts(counts)

      setMatches(getMatchedPeople().slice(0, 4))
      setClubs((await loadClubs()).slice(0, 4))
    }
    void load()
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <HomeTopbar />
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
