'use client'

import { useState } from 'react'
import type { PostBook } from '@/entities/post/api/postsRemote'
import BookPicker from './BookPicker'

interface PostFormProps {
  initialContent?: string
  initialBook?: PostBook | null
  submitLabel: string
  onSubmit: (params: { content: string; book: PostBook | null }) => Promise<void>
}

const MAX_LENGTH = 500

/** 글 작성·수정 공용 폼 */
export default function PostForm({
  initialContent = '',
  initialBook = null,
  submitLabel,
  onSubmit,
}: PostFormProps) {
  const [content, setContent] = useState(initialContent)
  const [book, setBook] = useState<PostBook | null>(initialBook)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit({ content, book })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bj-col-14">
      <textarea
        className="bj-textarea"
        placeholder="책, 독서, 취향에 대해 자유롭게 써보세요"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        maxLength={MAX_LENGTH}
        autoFocus
      />
      <p className="bj-caption bj-text-muted bj-text-right">
        {content.length}/{MAX_LENGTH}
      </p>

      <div>
        <p className="bj-section-tag bj-mb-8">책 첨부</p>
        <BookPicker value={book} onChange={setBook} />
      </div>

      <button
        type="submit"
        className="bj-btn bj-btn--primary bj-btn--block"
        disabled={!content.trim() || submitting}
      >
        {submitting ? '저장 중…' : submitLabel}
      </button>
    </form>
  )
}
