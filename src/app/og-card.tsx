// 공유 카드(OG) 렌더러 — next/og 내장 ImageResponse만 사용.
// 색은 tokens.css 원시값과 동일한 값을 하드코딩한다(satori는 CSS 변수를 못 읽음).
import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const CREAM = '#F7EFE6'
const INK = '#1A1A2E'
const INK_SOFT = '#5A5A68'
const ORANGE = '#F0562E'

export async function ogCard(opts: { emoji: string; title: string; subtitle: string; badge?: string }) {
  const wildgak = await readFile(join(process.cwd(), 'public/fonts/Wildgak.ttf'))

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: CREAM,
          padding: '80px 88px',
          fontFamily: 'Wildgak',
        }}
      >
        <div style={{ display: 'flex', width: 120, height: 12, background: ORANGE, borderRadius: 6 }} />
        <div style={{ display: 'flex', fontSize: 140, marginTop: 28 }}>{opts.emoji}</div>
        <div style={{ display: 'flex', fontSize: 88, color: INK, marginTop: 8, lineHeight: 1.2 }}>
          {opts.title}
        </div>
        <div style={{ display: 'flex', fontSize: 40, color: INK_SOFT, marginTop: 20, lineHeight: 1.4 }}>
          {opts.subtitle}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginTop: 'auto', gap: 16 }}>
          <div style={{ display: 'flex', fontSize: 34, color: ORANGE }}>북작</div>
          <div style={{ display: 'flex', fontSize: 30, color: INK_SOFT }}>
            {opts.badge ?? '취향으로 북적이는 독서 취향 소셜'}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: 'Wildgak', data: wildgak, style: 'normal', weight: 400 }],
    },
  )
}
