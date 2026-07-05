import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '북작 — 나의 독서 유형은?',
  description: '책을 통해 나의 취향과 생각이 연결되는 취향 기반 독서 소셜 플랫폼',
  openGraph: {
    title: '북작 — 나의 독서 유형은?',
    description: '12문항으로 알아보는 나의 독서 취향 유형. 16가지 중 나는?',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bookjak">
        <div id="app-root">
          {children}
        </div>
      </body>
    </html>
  )
}
