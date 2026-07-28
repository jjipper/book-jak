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
    <main className="bj-shell" style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 스피너 */}
      <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 48 }}>
        <div style={{
          position: 'absolute', inset: 0,
          border: '2px solid var(--color-border)',
          borderRadius: '50%',
          animation: 'spin 3s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 10,
          border: '2px solid transparent',
          borderTopColor: 'var(--color-action)',
          borderRadius: '50%',
          animation: 'spin 1.4s linear infinite',
        }} />
      </div>

      {/* 메시지 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p className="bj-h1" style={{ fontSize: 20, marginBottom: 8 }}>
          {LOADING_STEPS[stepIndex]?.text}
        </p>
        <p className="bj-caption">잠깐, 거의 다 됐어요</p>
      </div>

      {/* 진행바 */}
      <div style={{ width: '100%', maxWidth: 280 }}>
        <div className="bj-progress__track" style={{ marginBottom: 6 }}>
          <div className="bj-progress__fill" style={{ width: `${progress}%`, transition: 'width 0.1s linear' }} />
        </div>
        <p className="bj-caption" style={{ textAlign: 'right' }}>{Math.round(progress)}%</p>
      </div>

      <p className="bj-caption" style={{ marginTop: 48, textAlign: 'center', lineHeight: 1.7 }}>
        분석 결과는 책 읽는 성향 기반이에요.<br />
        점성술이나 혈액형보단 정확합니다 (아마도)
      </p>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      `}</style>
    </main>
  )
}
