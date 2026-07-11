'use client'

import { useEffect, useRef, useState } from 'react'

interface IllustPlaceholderProps {
  code: string
  alt: string
  aspectRatio?: string
  className?: string
}

// 실제 일러스트 파일이 없을 때 그려주는 표지풍 플레이스홀더 색상 조합
const COVER_PALETTES: Array<{ bg: string; deco: string; text: string }> = [
  { bg: '#2F4838', deco: '#4C6B54', text: '#F3EFE6' },
  { bg: '#5B3A2E', deco: '#7C5546', text: '#F5EDE2' },
  { bg: '#31405F', deco: '#4C5F87', text: '#EEF1F7' },
  { bg: '#6B4A63', deco: '#8A6683', text: '#F6EEF4' },
  { bg: '#7A5A28', deco: '#9C7B45', text: '#F7F1E3' },
  { bg: '#3F5A5E', deco: '#5D7D82', text: '#EDF4F4' },
  { bg: '#84424B', deco: '#A3616A', text: '#F8EEEF' },
  { bg: '#4A4458', deco: '#675F7A', text: '#F1EFF6' },
]

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

export default function IllustPlaceholder({
  code,
  alt,
  aspectRatio = '4 / 3',
  className,
}: IllustPlaceholderProps) {
  const [failed, setFailed] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  // SSR로 렌더된 <img>는 hydration 전에 브라우저가 먼저 요청을 보내서,
  // 로컬 404처럼 아주 빨리 끝나는 실패는 onError가 놓칠 수 있다 — 마운트 시 재확인.
  useEffect(() => {
    const img = imgRef.current
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true)
    }
  }, [])

  const palette = COVER_PALETTES[hashCode(code) % COVER_PALETTES.length]

  return (
    <div
      className={`bj-illust${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, width: '100%', background: 'var(--color-bg-sunken)' }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img ref={imgRef} src={`/assets/illust/${code}.png`} alt={alt} onError={() => setFailed(true)} />
      ) : (
        <div
          role="img"
          aria-label={alt}
          style={{
            width: '100%',
            height: '100%',
            background: palette.bg,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '12% 10%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            containerType: 'inline-size',
          }}
        >
          <span style={{ display: 'block', width: '28%', height: 3, background: palette.deco, borderRadius: 2 }} />
          <span
            style={{
              color: palette.text,
              fontWeight: 700,
              fontSize: 'clamp(9px, 14cqw, 15px)',
              lineHeight: 1.35,
              wordBreak: 'keep-all',
              display: '-webkit-box',
              WebkitLineClamp: 4,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {alt}
          </span>
          <span style={{ display: 'block', width: '46%', height: 3, background: palette.deco, borderRadius: 2, alignSelf: 'flex-end' }} />
        </div>
      )}
    </div>
  )
}
