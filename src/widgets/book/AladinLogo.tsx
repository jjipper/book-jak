'use client'

// 알라딘 로고 — 공식 로고 파일(public/brand/aladin-logo.png)을 그대로 쓴다.
// 파일이 없거나 못 불러오면 깨진 이미지 대신 텍스트 "알라딘"으로 대체.

import { useState } from 'react'

export default function AladinLogo() {
  const [failed, setFailed] = useState(false)
  if (failed) return <span>알라딘</span>
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/aladin-logo.png" alt="알라딘" className="bj-aladin-logo" onError={() => setFailed(true)} />
  )
}
