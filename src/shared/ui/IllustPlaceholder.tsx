'use client'

import { useEffect, useRef, useState } from 'react'

interface IllustPlaceholderProps {
  code: string
  alt: string
  aspectRatio?: string
  className?: string
  /** 이미지 없을 때 폴백: cover = 표지풍(어두운 색면), slot = 밝은 빈 슬롯(파일명 표기) */
  fallback?: 'cover' | 'slot'
  /** contain = 투명 배경 일러스트를 자르지 않고 전부 표시 */
  fit?: 'cover' | 'contain'
  /** 투명 PNG 뒤 배경. 카드 위에 얹을 땐 카드 표면색을 넘긴다 */
  background?: string
}

// 실제 일러스트 파일이 없을 때 그려주는 표지풍 플레이스홀더 색상 조합 수 (팔레트는 components.css .bj-illust-wrap__cover--0..7)
const COVER_PALETTE_COUNT = 8

function hashCode(str: string): number {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// 코드에서 서브폴더를 자동 해석: type/ covers/ club/ intro/
// 이미 슬래시가 포함된 코드(예: "type/TCER")는 그대로 사용
function resolveIllustPath(code: string): string {
  if (code.includes('/')) return code
  if (/^[TF][A-Z]{3}$/.test(code)) return `type/${code}`
  if (code.startsWith('blind-') || code.startsWith('book-')) return `covers/${code}`
  if (code.startsWith('CLUB_')) return `club/${code}`
  if (code.startsWith('intro_')) return `intro/${code}`
  return code
}

export default function IllustPlaceholder({
  code,
  alt,
  aspectRatio = '4 / 3',
  className,
  fallback = 'cover',
  fit = 'cover',
  background = 'var(--color-bg-sunken)',
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

  const paletteIndex = hashCode(code) % COVER_PALETTE_COUNT

  return (
    <div
      className={`bj-illust bj-illust-wrap${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, background }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`/assets/illust/${resolveIllustPath(code)}.png`}
          alt={alt}
          className={`bj-illust-wrap__img bj-illust-wrap__img--${fit === 'contain' ? 'contain' : 'cover'}`}
          onError={() => setFailed(true)}
        />
      ) : fallback === 'slot' ? (
        <div
          role="img"
          aria-label={alt}
          className="bj-illust-wrap__slot"
        >
          <span className="bj-illust-wrap__slot-label">
            illust/{code}.png
          </span>
        </div>
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={`bj-illust-wrap__cover bj-illust-wrap__cover--${paletteIndex}`}
        >
          <span className="bj-illust-wrap__cover-bar" />
          <span className="bj-illust-wrap__cover-title">{alt}</span>
          <span className="bj-illust-wrap__cover-bar bj-illust-wrap__cover-bar--end" />
        </div>
      )}
    </div>
  )
}
