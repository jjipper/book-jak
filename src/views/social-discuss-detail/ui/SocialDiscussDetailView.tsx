'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadQuestion, loadAnswers, addAnswer, type DiscussionQuestion, type DiscussionAnswer } from '@/entities/discussion/model/discussionActions'
import { resolveAuthor } from '@/features/resolve-author/model/author'
import { isLiked, toggleLike } from '@/features/like/model/likes'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

export default function SocialDiscussDetailView() {
  const params = useParams<{ id: string }>()
  const [question, setQuestion] = useState<DiscussionQuestion | null>(null)
  const [answers, setAnswers] = useState<DiscussionAnswer[]>([])
  const [text, setText] = useState('')
  const [liked, setLiked] = useState(false)
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()

  useEffect(() => {
    setQuestion(loadQuestion(params.id) ?? null)
    setAnswers(loadAnswers(params.id))
    setLiked(isLiked(params.id))
  }, [params.id])

  function handleToggleLike() {
    setLiked(toggleLike(params.id))
  }

  function handleSubmit() {
    if (!text.trim()) return
    requireNickname(() => {
      addAnswer(params.id, text.trim())
      setAnswers(loadAnswers(params.id))
      setText('')
    })
  }

  if (!question) {
    return (
      <main style={{ minHeight: '100dvh', padding: '52px 20px' }}>
        <Link href="/social/discuss" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
      </main>
    )
  }

  const author = resolveAuthor(question.authorId)

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/social/discuss" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">{bookTitle(question.bookId)}</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bj-callout">
          <p style={{ marginBottom: 8 }}>{question.text}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p className="bj-caption" style={{ color: 'inherit', opacity: 0.8 }}>{author.nickname}</p>
            <button
              type="button"
              onClick={handleToggleLike}
              aria-label="좋아요"
              style={{
                display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer',
                color: 'inherit', opacity: liked ? 1 : 0.7,
              }}
            >
              <HeartIcon filled={liked} />
              <span className="bj-caption" style={{ color: 'inherit' }}>{(question.likeCount ?? 0) + (liked ? 1 : 0)}</span>
            </button>
          </div>
        </div>

        <p className="bj-caption" style={{ fontWeight: 700 }}>답변 {answers.length}개</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {answers.map((a) => {
            const answerAuthor = resolveAuthor(a.authorId)
            return (
              <div key={a.id} className="bj-row" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p className="bj-body" style={{ fontSize: 14, marginBottom: 4 }}>{a.text}</p>
                  <p className="bj-caption">{answerAuthor.nickname}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea
            className="bj-textarea"
            placeholder="답변을 남겨보세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ minHeight: 72 }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bj-btn bj-btn--primary bj-btn--block"
            style={{ padding: '14px 0', opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'not-allowed' }}
          >
            답변 등록
          </button>
        </div>
      </div>

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
    </main>
  )
}
