'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useTestStore } from '@/features/quiz-test/model/testStore'
import { QUESTIONS } from '@/entities/reading-type/model/questions'
import type { TestAnswer } from '@/entities/reading-type/model/scoring'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import Option from '@/shared/ui/Option'
import Icon, { type IconName } from '@/shared/ui/Icon'
import ConfirmSheet from '@/shared/ui/ConfirmSheet'
import Logo from '@/shared/ui/Logo'
import './TestView.css'

const AXIS_LABELS: Record<string, string> = {
  FT: '감정·사유',
  IC: '몰입·사색',
  EG: '도피·성장',
  RW: '현실·환상',
}

// 축별 일러스트는 아직 없어서, 축 성격에 맞는 기존 아이콘을 문항 카드에 쓴다
const AXIS_ICONS: Record<string, IconName> = {
  FT: 'heart',
  IC: 'eye',
  EG: 'compass',
  RW: 'moon',
}

export default function TestView() {
  const router = useRouter()
  const { currentStep, answers, selectAnswer, goBack, resetTest } = useTestStore()
  const [started, setStarted] = useState(false)
  const [quitOpen, setQuitOpen] = useState(false)

  const question = QUESTIONS[currentStep]

  const currentAnswer = answers.find((a) => a.questionId === question.id)

  function handleSelect(optionId: string, value: string, badgeKey?: string) {
    const answer: TestAnswer = {
      questionId: question.id,
      selectedOptionId: optionId,
      value: value as TestAnswer['value'],
      badgeKey,
    }
    selectAnswer(answer)
    // ?from=친구유형 을 결과 화면까지 넘겨 궁합 비교로 잇는다
    if (useTestStore.getState().isComplete) router.push(`/test/loading${window.location.search}`)
  }

  // ── 인트로 화면 (테스트 시작 전 커버) ──────────────────────
  if (!started) {
    return (
      <main className="bj-shell bj-shell--col">
        <div className="bj-frame bj-frame--col">
        <header className="bj-page-head">
          <Link href="/home" className="bj-unstyled-link">
            <Logo />
          </Link>
        </header>

        <section className="bj-intro-section">
          <div>
            <p className="bj-caption bj-bold bj-intro-tagline">
              독서 취향 소셜
            </p>
            <h1 className="bj-display bj-display--xl bj-display--intro">
              나의<br />BOOKBTI는<br />뭘까
            </h1>
            <p className="bj-body bj-intro-sub">
              12문항으로 알아보는 나의 독서 취향.<br />
              16가지 유형 중 나는 어디에 속할까.
            </p>
          </div>

          <IllustPlaceholder code="intro_test" alt="BOOKBTI 테스트" aspectRatio="4 / 3" fit="contain" background="transparent" />

          <div className="bj-col-10">
            <button onClick={() => { resetTest(); setStarted(true) }} className="bj-btn bj-btn--primary bj-btn--block bj-btn--cta-xl">
              테스트 시작
            </button>
            <p className="bj-caption bj-text-center">
              약 3분이면 끝나요. 가입하지 않아도 돼요
            </p>
          </div>

          <div className="bj-card--flat bj-stat-spread">
            {[
              { value: '16가지', label: 'BOOKBTI 유형' },
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
          aria-label="이전"
        >
          <Icon name="chevron-left" size={24} />
        </button>

        <span className="bj-test-head__title">BOOKBTI</span>

        <button onClick={() => setQuitOpen(true)} className="bj-icon-btn" aria-label="그만두기">
          <Icon name="x" size={24} />
        </button>
      </header>

      {/* 진행 상황 — 문항 수만큼 점, 숫자는 보조 */}
      <div
        className="bj-test-dots"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={QUESTIONS.length}
        aria-valuenow={currentStep + 1}
        aria-label={`${QUESTIONS.length}문항 중 ${currentStep + 1}번째`}
      >
        {QUESTIONS.map((q, i) => (
          <span
            key={q.id}
            className={`bj-test-dot${i < currentStep ? ' bj-test-dot--done' : i === currentStep ? ' bj-test-dot--current' : ''}`}
          />
        ))}
        <span className="bj-caption bj-test-dots__count">{currentStep + 1}/{QUESTIONS.length}</span>
      </div>

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
        <div className="bj-card bj-question-card bj-mb-20">
          <div className="bj-question-card__icon" aria-hidden="true">
            <Icon name={AXIS_ICONS[question.axis]} size={36} />
          </div>
          <p className="bj-caption bj-bold bj-question-num">
            Q{question.id}. {AXIS_LABELS[question.axis]}
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
          {question.options.map((option) => (
            <Option
              key={option.id}
              optionKey={option.id}
              selected={currentAnswer?.selectedOptionId === option.id}
              onSelect={() => handleSelect(option.id, option.value, option.badgeKey)}
            >
              {option.label}
            </Option>
          ))}
        </div>

        <p className="bj-caption bj-text-center bj-question-hint">
          {question.type === 'quad' ? '가장 가까운 것 하나만 고르면 돼요' : '솔직하게 고를수록 정확해요'}
        </p>
      </div>

      <ConfirmSheet
        open={quitOpen}
        message="정말 그만둘까요?"
        confirmLabel="그만두기"
        cancelLabel="계속하기"
        onConfirm={() => { resetTest(); router.push('/home') }}
        onCancel={() => setQuitOpen(false)}
      />
      </div>
    </main>
  )
}
