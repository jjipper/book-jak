'use client'

import { useEffect, useRef, useState } from 'react'

interface IllustPlaceholderProps {
  code: string
  alt: string
  aspectRatio?: string
  className?: string
  /** contain = 투명 배경 일러스트를 자르지 않고 전부 표시 */
  fit?: 'cover' | 'contain'
  /** 투명 PNG 뒤 배경. 카드 위에 얹을 땐 카드 표면색을 넘긴다 */
  background?: string
  /** 첫 화면의 큰 그림(LCP) — 우선 요청. 나머지는 화면에 들어올 때 지연 로드한다 */
  priority?: boolean
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
  fit = 'cover',
  background = 'var(--color-bg-sunken)',
  priority = false,
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
      className={`bj-illust bj-illust-wrap${className ? ` ${className}` : ''}`}
      style={{ aspectRatio, background }}
    >
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`/assets/illust/${resolveIllustPath(code)}.webp`}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          className={`bj-illust-wrap__img bj-illust-wrap__img--${fit === 'contain' ? 'contain' : 'cover'}`}
          onError={() => setFailed(true)}
        />
      ) : (
        // 일러스트가 없을 때 — 흰 면 + 연한 회색 책 아이콘만. 자리만 지키고 눈에 띄지 않게.
        <div role="img" aria-label={alt} className="bj-illust-wrap__empty">
          <svg
            className="bj-illust-wrap__empty-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
      )}
    </div>
  )
}
