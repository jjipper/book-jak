'use client'

import './globals.css'

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body className="bookjak bj-body">
        <main className="bj-shell">
          <div className="bj-frame">
            <div className="bj-content--lg bj-pad-v-lg bj-text-center">
              <p className="bj-h1 bj-mb-8">앱을 불러오지 못했어요</p>
              <p className="bj-caption bj-text-muted bj-mb-20">새로고침하면 대부분 해결돼요</p>
              <button type="button" onClick={reset} className="bj-btn bj-btn--primary bj-btn--block">
                다시 시도
              </button>
            </div>
          </div>
        </main>
      </body>
    </html>
  )
}
