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

/** 궁합 초대 카드 — 왼쪽 친구 유형, 오른쪽 "?"(받는 사람) 두 사람이 마주 보는 레이아웃 */
export async function ogInviteCard(opts: { emoji: string; name: string; code: string }) {
  const wildgak = await readFile(join(process.cwd(), 'public/fonts/Wildgak.ttf'))
  const bubble = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 220,
    height: 220,
    borderRadius: 110,
    background: '#FFFFFF',
  } as const

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          background: CREAM,
          padding: '72px 88px',
          fontFamily: 'Wildgak',
          gap: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ ...bubble, fontSize: 120 }}>{opts.emoji}</div>
          <div style={{ display: 'flex', fontSize: 72, color: ORANGE }}>♥</div>
          <div style={{ ...bubble, fontSize: 120, color: ORANGE, border: `8px dashed ${ORANGE}` }}>?</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <div style={{ display: 'flex', width: 96, height: 12, background: ORANGE, borderRadius: 6 }} />
          <div style={{ display: 'flex', fontSize: 72, color: INK, marginTop: 28, lineHeight: 1.2 }}>
            나랑 독서 궁합 볼래?
          </div>
          <div style={{ display: 'flex', fontSize: 36, color: INK_SOFT, marginTop: 20, lineHeight: 1.4 }}>
            {`${opts.name} 친구가 보낸 초대장`}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: 48, gap: 16 }}>
            <div style={{ display: 'flex', fontSize: 34, color: ORANGE }}>북작</div>
            <div style={{ display: 'flex', fontSize: 28, color: INK_SOFT }}>{`${opts.code} · BOOKBTI 궁합`}</div>
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
