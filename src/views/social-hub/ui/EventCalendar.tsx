'use client'

import { useState } from 'react'
import type { BookEvent } from '@/entities/event/model/events'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

interface EventCalendarProps {
  events: BookEvent[]
}

export default function EventCalendar({ events }: EventCalendarProps) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstWeekday = new Date(year, month, 1).getDay()

  const eventDays = new Set(
    events
      .filter((e): e is BookEvent & { eventDate: string } => e.eventDate != null)
      .map((e) => new Date(e.eventDate))
      .filter((d) => d.getFullYear() === year && d.getMonth() === month)
      .map((d) => d.getDate()),
  )

  const cells: (number | null)[] = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="bj-calendar">
      <div className="bj-calendar__head">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          className="bj-icon-btn"
          aria-label="이전 달"
        >
          <ChevronLeftIcon />
        </button>
        <p className="bj-h2">{year}년 {month + 1}월</p>
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          className="bj-icon-btn"
          aria-label="다음 달"
        >
          <ChevronRightIcon />
        </button>
      </div>
      <div className="bj-calendar__weekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="bj-caption">{w}</span>
        ))}
      </div>
      <div className="bj-calendar__grid">
        {cells.map((day, i) => (
          <div key={i} className="bj-calendar__cell">
            {day != null && (
              <>
                <span className="bj-caption">{day}</span>
                {eventDays.has(day) && <span className="bj-calendar__dot" aria-hidden="true" />}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
