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
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '52px 24px 8px' }}>
          <Link href="/home" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span className="bj-riso" style={{ width: 26, height: 26 }}>
              <span className="bj-riso__a" style={{ width: 26, height: 26, background: 'var(--color-action)' }} />
              <span className="bj-riso__b" style={{ width: 26, height: 26, background: 'var(--p-riso-blue)' }} />
            </span>
            <span className="bj-display bj-display--lg">북작</span>
          </Link>
        </header>

        <section style={{ flex: 1, padding: '32px 24px 40px', display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div>
            <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-action)', marginBottom: 12 }}>
              독서 취향 소셜
            </p>
            <h1 className="bj-display bj-display--xl" style={{ fontSize: 40, lineHeight: 1.2, marginBottom: 16 }}>
              나의<br />독서 유형은<br />뭘까
            </h1>
            <p className="bj-body" style={{ color: 'var(--color-text-muted)' }}>
              12문항으로 알아보는 나의 독서 취향.<br />
              16가지 유형 중 나는 어디에 속할까.
            </p>
          </div>

          {/* 일러스트 자리 — 실제 이미지는 추후 삽입 */}
          <IllustPlaceholder code="test-intro" alt="독서유형 테스트" aspectRatio="4 / 3" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => setStarted(true)} className="bj-btn bj-btn--primary bj-btn--block" style={{ padding: '18px 0', fontSize: 18 }}>
              테스트 시작
            </button>
            <p className="bj-caption" style={{ textAlign: 'center' }}>
              가입 없이 바로 시작 · 약 3분 소요
            </p>
          </div>

          <div className="bj-card--flat" style={{ display: 'flex', justifyContent: 'space-around' }}>
            {[
              { value: '16가지', label: '독서 유형' },
              { value: '12문항', label: '정확한 진단' },
              { value: '100%', label: '무료' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <p className="bj-display bj-display--lg" style={{ fontSize: 20, color: 'var(--color-action)', marginBottom: 4 }}>
                  {stat.value}
                </p>
                <p className="bj-caption">{stat.label}</p>
              </div>
            ))}
          </div>

          <p className="bj-caption" style={{ textAlign: 'center' }}>
            책을 통해 사람의 취향이 연결되는 소셜 네트워크
          </p>
        </section>
      </main>
    )
  }

  // ── 진단 문항 화면 ──────────────────────
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>

      {/* 상단 헤더 */}
      <header style={{ padding: '48px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
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
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span className="bj-caption">{currentStep + 1} / {QUESTIONS.length}</span>
            <span className="bj-caption" style={{ fontWeight: 700, color: 'var(--color-action)' }}>{Math.round(progressPct)}%</span>
          </div>
          <div className="bj-progress__track">
            <div className="bj-progress__fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      {/* 축 인디케이터 */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
      <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column' }}>
        <div className="bj-card" style={{ marginBottom: 20 }}>
          <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)', marginBottom: 14 }}>
            Q{question.id}.
          </p>
          <h2 className="bj-h1" style={{ fontSize: 22, lineHeight: 1.4 }}>
            {question.text}
          </h2>
          {question.subText && (
            <p className="bj-caption" style={{ marginTop: 8 }}>{question.subText}</p>
          )}
        </div>

        {/* 선택지 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {question.options.map((option) => {
            const isSelected = currentAnswer?.selectedOptionId === option.id
            return (
              <button
                key={option.id}
                onClick={() => handleSelect(option.id, option.value, option.badgeKey)}
                className={`bj-choice${isSelected ? ' is-active' : ''}`}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <span style={{
                  flexShrink: 0,
                  width: 26, height: 26, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: isSelected ? 'var(--color-action)' : 'var(--color-bg-sunken)',
                  color: isSelected ? 'var(--color-text-on-action)' : 'var(--color-text-hint)',
                  marginTop: 1,
                }}>
                  {option.id}
                </span>
                <span style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>

        <p className="bj-caption" style={{ textAlign: 'center', margin: '24px 0 32px' }}>
          {question.type === 'quad' ? '가장 가까운 것 하나만 고르면 돼요' : '솔직하게 고를수록 정확해요'}
        </p>
      </div>
    </main>
  )
}
