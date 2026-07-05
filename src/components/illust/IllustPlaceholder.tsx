'use client'

import { useEffect, useRef, useState } from 'react'

interface IllustPlaceholderProps {
  code: string
  alt: string
  aspectRatio?: string
  className?: string
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

  return (
    <div
      className={`bj-illust${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, width: '100%', background: 'var(--color-bg-sunken)' }}
    >
      {!failed && (
        <img ref={imgRef} src={`/assets/illust/${code}.png`} alt={alt} onError={() => setFailed(true)} />
      )}
    </div>
  )
}
