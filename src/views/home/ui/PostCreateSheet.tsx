'use client'

import { useState } from 'react'
import Sheet from '@/shared/ui/Sheet'
import { createPost } from '@/entities/post/api/postsRemote'
import type { Post } from '@/entities/post/model/posts'

interface PostCreateSheetProps {
  open: boolean
  onClose: () => void
  onCreated: (post: Post) => void
}

export default function PostCreateSheet({ open, onClose, onCreated }: PostCreateSheetProps) {
  const [content, setContent] = useState('')
  const [bookTitle, setBookTitle] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // DB 제약은 2자 이상 — 1자 글이 등록 실패로 떨어지지 않게 여기서 막는다
  const tooShort = content.trim().length < 2

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (tooShort || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const post = await createPost({ content, bookTitle: bookTitle.trim() || null })
      onCreated(post)
      setContent('')
      setBookTitle('')
      onClose()
    } catch {
      setError('올리지 못했어요. 잠시 후 다시 시도해 주세요')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <form onSubmit={handleSubmit} className="bj-col-14">
        <div className="bj-row-between bj-mb-16">
          <p className="bj-h2">글 쓰기</p>
          <button type="button" onClick={onClose} className="bj-icon-btn" aria-label="닫기">
            <CloseIcon />
          </button>
        </div>

        <textarea
          className="bj-textarea"
          placeholder="책, 독서, 취향에 대해 자유롭게 써보세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={5}
          maxLength={500}
          autoFocus
        />
        <p className="bj-caption bj-text-muted" style={{ textAlign: 'right' }}>
          {content.length}/500
        </p>

        <input
          className="bj-input"
          type="text"
          placeholder="책 제목 태그 (선택)"
          value={bookTitle}
          onChange={(e) => setBookTitle(e.target.value)}
          maxLength={80}
        />

        {error && <p className="bj-caption bj-text-muted">{error}</p>}

        <button
          type="submit"
          className="bj-btn bj-btn--primary"
          disabled={tooShort || submitting}
        >
          {submitting ? '등록 중…' : '올리기'}
        </button>
      </form>
    </Sheet>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
