'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTestStore } from '@/features/quiz-test/model/testStore'
import { QUESTIONS } from '@/entities/reading-type/model/questions'
import type { TestAnswer } from '@/entities/reading-type/model/scoring'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

const AXIS_LABELS: Record<string, string> = {
  FT: '감정 · 사유',
  IC: '몰입 · 사색',
  EG: '도피 · 성장',
  RW: '현실 · 환상',
}

export default function TestView() {
  const router = useRouter()
  const { currentStep, answers, isComplete, selectAnswer, goBack, resetTest } = useTestStore()
  const [started, setStarted] = useState(false)

  const question = QUESTIONS[currentStep]

  useEffect(() => {
    if (isComplete) {
      router.push('/test/loading')
    }
  }, [isComplete, router])

  const currentAnswer = answers.find((a) => a.questionId === question.id)

  function handleSelect(optionId: string, value: string, badgeKey?: string) {
    const answer: TestAnswer = {
      questionId: question.id,
      selectedOptionId: optionId,
      value: value as TestAnswer['value'],
      badgeKey,
    }
    selectAnswer(answer)
  }

  const progressPct = ((currentStep + 1) / QUESTIONS.length) * 100

  // ── 인트로 화면 (테스트 시작 전 커버) ──────────────────────
  if (!started) {
    return (
      <main className="bj-shell bj-shell--col">
        <div className="bj-frame bj-frame--col">
        <header className="bj-page-head">
          <Link href="/home" className="bj-inline-row">
            <span className="bj-riso bj-riso--26">
              <span className="bj-riso__a bj-riso__a--action" />
              <span className="bj-riso__b bj-riso__b--blue" />
            </span>
            <span className="bj-display bj-display--lg">북작</span>
          </Link>
        </header>

        <section className="bj-intro-section">
          <div>
            <p className="bj-caption bj-bold bj-intro-tagline">
              독서 취향 소셜
            </p>
            <h1 className="bj-display bj-display--xl bj-display--intro">
              나의<br />독서 유형은<br />뭘까
            </h1>
            <p className="bj-body bj-intro-sub">
              12문항으로 알아보는 나의 독서 취향.<br />
              16가지 유형 중 나는 어디에 속할까.
            </p>
          </div>

          <IllustPlaceholder code="intro_test" alt="독서유형 테스트" aspectRatio="4 / 3" fit="contain" background="transparent" />

          <div className="bj-col-10">
            <button onClick={() => setStarted(true)} className="bj-btn bj-btn--primary bj-btn--block bj-btn--cta-xl">
              테스트 시작
            </button>
            <p className="bj-caption bj-text-center">
              가입 없이 바로 시작 · 약 3분 소요
            </p>
          </div>

          <div className="bj-card--flat bj-stat-spread">
            {[
              { value: '16가지', label: '독서 유형' },
              { value: '12문항', label: '정확한 진단' },
              { value: '100%', label: '무료' },
            ].map((stat) => (
              <div key={stat.label} className="bj-text-center">
                <p className="bj-display bj-display--lg bj-stat-value">
                  {stat.value}
                </p>
                <p className="bj-caption">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="bj-caption bj-text-center">
            책을 통해 사람의 취향이 연결되는 소셜 네트워크
          </p>
        </section>
        </div>
      </main>
    )
  }

  // ── 진단 문항 화면 ──────────────────────
  return (
    <main className="bj-shell bj-shell--col">
      <div className="bj-frame bj-frame--col">

      {/* 상단 헤더 */}
      <header className="bj-subpage-head">
        <button
          onClick={() => {
            if (currentStep === 0) { resetTest(); setStarted(false) }
            else goBack()
          }}
          className="bj-icon-btn"
        >
          ←
        </button>

        {/* 진행바 */}
        <div className="bj-progress-wrap">
          <div className="bj-row-between bj-mb-6">
            <span className="bj-caption">{currentStep + 1} / {QUESTIONS.length}</span>
            <span className="bj-caption bj-bold bj-progress-pct">{Math.round(progressPct)}%</span>
          </div>
          <div className="bj-progress__track">
            <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      {/* 축 인디케이터 */}
      <div className="bj-axis-row">
        {(['FT', 'IC', 'EG', 'RW'] as const).map((axis, i) => {
          const isDone = i < Math.floor(currentStep / 3)
          const isCurrent = i === Math.floor(currentStep / 3)
          return (
            <span key={axis} className={`bj-chip${isDone ? ' bj-chip--done' : isCurrent ? ' bj-chip--active' : ''}`}>
              {AXIS_LABELS[axis]}{isDone ? ' ✓' : ''}
            </span>
          )
        })}
      </div>

      {/* 문항 카드 */}
      <div className="bj-question-area">
        <div className="bj-card bj-mb-20">
          <p className="bj-caption bj-bold bj-question-num">
            Q{question.id}.
          </p>
          <h2 className="bj-h1 bj-h1--question">
            {question.text}
          </h2>
          {question.subText && (
            <p className="bj-caption bj-mt-8">{question.subText}</p>
          )}
        </div>

        {/* 선택지 */}
        <div className="bj-col-10">
          {question.options.map((option) => {
            const isSelected = currentAnswer?.selectedOptionId === option.id
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id, option.value, option.badgeKey)}
                className={`bj-choice bj-choice--flex-row${isSelected ? ' is-active' : ''}`}
              >
                <span
                  className="bj-choice-badge"
                  style={{
                    background: isSelected ? 'var(--color-accent)' : 'var(--color-bg-sunken)',
                    color: isSelected ? 'var(--color-text-on-accent)' : 'var(--color-text-caption)',
                  }}
                >
                  {option.id}
                </span>
                <span className="bj-choice-text">
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        <p className="bj-caption bj-text-center bj-question-hint">
          {question.type === 'quad' ? '가장 가까운 것 하나만 고르면 돼요' : '솔직하게 고를수록 정확해요'}
        </p>
      </div>
      </div>
    </main>
  )
}
