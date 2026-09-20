'use client'

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <div className="bj-content--lg bj-pad-v-lg bj-text-center">
          <p className="bj-h1 bj-mb-8">잠시 문제가 생겼어요</p>
          <p className="bj-caption bj-text-muted bj-mb-20">다시 시도해도 안 되면 잠시 후에 들러주세요</p>
          <button type="button" onClick={reset} className="bj-btn bj-btn--primary bj-btn--block">
            다시 시도
          </button>
        </div>
      </div>
    </main>
  )
}
