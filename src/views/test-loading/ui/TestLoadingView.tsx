'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useTestStore } from '@/features/quiz-test/model/testStore'

const LOADING_STEPS = [
  { text: '답변을 분석하는 중...', duration: 900 },
  { text: '독서 뇌구조를 계산하는 중...', duration: 900 },
  { text: '16가지 유형과 대조하는 중...', duration: 900 },
  { text: '스탯을 최적화하는 중...', duration: 700 },
  { text: '결과 카드를 인쇄하는 중...', duration: 600 },
]

export default function TestLoadingView() {
  const router = useRouter()
  const { result } = useTestStore()
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!result) { router.replace('/test'); return }

    let currentStep = 0
    const total = LOADING_STEPS.reduce((s, step) => s + step.duration, 0)
    let elapsed = 0

    function tick() {
      if (currentStep >= LOADING_STEPS.length) {
        router.push(`/result/${result!.typeCode}`)
        return
      }
      setStepIndex(currentStep)
      const stepDuration = LOADING_STEPS[currentStep].duration
      const stepStart = elapsed
      const startTime = Date.now()

      const interval = setInterval(() => {
        const dt = Date.now() - startTime
        elapsed = stepStart + dt
        setProgress(Math.min(99, (elapsed / total) * 100))
        if (dt >= stepDuration) {
          clearInterval(interval)
          currentStep++
          tick()
        }
      }, 16)
    }
    tick()
  }, [result, router])

  return (
    <main className="bj-shell bj-shell--center">
      {/* 스피너 */}
      <div className="bj-spinner-wrap">
        <div className="bj-spinner-ring" />
        <div className="bj-spinner-ring--inner" />
      </div>

      {/* 메시지 */}
      <div className="bj-text-center bj-loading-msg">
        <p className="bj-h1 bj-loading-title">
          {LOADING_STEPS[stepIndex]?.text}
        </p>
        <p className="bj-caption">잠깐, 거의 다 됐어요</p>
      </div>

      {/* 진행바 */}
      <div className="bj-loading-progress">
        <div className="bj-progress__track bj-loading-track">
          <div className="bj-progress__fill" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
        </div>
        <p className="bj-caption bj-loading-pct">{Math.round(progress)}%</p>
      </div>

      <p className="bj-caption bj-text-center bj-loading-caption">
        분석 결과는 책 읽는 성향 기반이에요.<br />
        점성술이나 혈액형보단 정확합니다 (아마도)
      </p>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </main>
  )
}
