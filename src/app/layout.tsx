import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { SITE_URL } from './site-url'

const TITLE = '북작 — 나의 독서 유형 BOOKBTI는?'
const DESCRIPTION = '12문항으로 알아보는 나의 독서 취향 유형. 16가지 중 나는? 취향으로 북적이는 독서 취향 소셜, 북작.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: '%s · 북작' },
  description: DESCRIPTION,
  applicationName: '북작',
  keywords: ['독서 유형 테스트', 'BOOKBTI', '북작', 'BOOKJAK', '독서 MBTI', '책 추천', '독서 취향'],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: '북작',
    locale: 'ko_KR',
    type: 'website',
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        {/* CSS @import는 globals.css를 받은 뒤에야 요청이 시작돼 렌더를 한 단계 더 막는다 → link로 병렬 요청.
            dynamic-subset은 페이지에 쓰인 글자 범위의 woff2만 받는다 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="bookjak bj-body">
        <div id="app-root">
          {children}
        </div>
        {/* 방문·유입(Analytics)과 실사용자 Core Web Vitals(Speed Insights). Vercel 대시보드에서 켜야 수집된다 */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
