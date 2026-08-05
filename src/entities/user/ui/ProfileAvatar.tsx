'use client'

import { useRef } from 'react'
import { toast } from '@/shared/lib/toast'

interface ProfileAvatarProps {
  src: string | null
  size?: number
  onChange: (dataUrl: string) => void
}

function DefaultAvatarIcon() {
  return (
    <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

// 업로드한 사진을 정사각으로 잘라 리사이즈 후 JPEG로 압축 — localStorage 용량 보호
function resizeToDataUrl(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('canvas unavailable')); return }
        const side = Math.min(img.width, img.height)
        const sx = (img.width - side) / 2
        const sy = (img.height - side) / 2
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ProfileAvatar({ src, size = 64, onChange }: ProfileAvatarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await resizeToDataUrl(file, 240)
      onChange(dataUrl)
    } catch {
      toast.error('사진 변환에 실패했어요')
    } finally {
      e.target.value = ''
    }
  }

  return (
    <div className="bj-avatar-wrap" style={{ width: size, height: size }}>
      <div
        className="bj-avatar-circle"
        style={{ width: size, height: size }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="프로필 사진" className="bj-avatar-img" />
        ) : (
          <DefaultAvatarIcon />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label="프로필 사진 바꾸기"
        className="bj-avatar-btn"
      >
        <CameraIcon />
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="bj-hidden" />
    </div>
  )
}
