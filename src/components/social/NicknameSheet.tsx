'use client'

import { useState } from 'react'

interface NicknameSheetProps {
  onSubmit: (name: string) => void
  onClose: () => void
  initialValue?: string
}

export default function NicknameSheet({ onSubmit, onClose, initialValue = '' }: NicknameSheetProps) {
  const [name, setName] = useState(initialValue)

  function handleSubmit() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
  }

  return (
    <div className="bj-sheet__overlay" onClick={onClose}>
      <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
        <p className="bj-h2" style={{ marginBottom: 6 }}>닉네임을 알려주세요</p>
        <p className="bj-caption" style={{ marginBottom: 16 }}>
          질문·모임에 표시될 이름이에요. 나중에 마이페이지에서 바꿀 수 있어요
        </p>
        <input
          type="text"
          className="bj-input"
          placeholder="예: 새벽세시"
          maxLength={12}
          value={name}
          autoFocus
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
          style={{ marginBottom: 16 }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="bj-btn bj-btn--primary bj-btn--block"
          style={{ padding: '14px 0', opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? 'pointer' : 'not-allowed' }}
        >
          시작하기
        </button>
      </div>
    </div>
  )
}
