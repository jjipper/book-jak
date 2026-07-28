'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadQuestions, loadAnswers, addQuestion, type DiscussionQuestion } from '@/entities/discussion/model/discussionActions'
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  )
}

export default function SocialDiscussView() {
  const router = useRouter()
  const [questions, setQuestions] = useState<DiscussionQuestion[]>([])
  const [likedIds, setLikedIds] = useState<string[]>([])

  useEffect(() => {
    const qs = loadQuestions()
    setQuestions(qs)
    setLikedIds(qs.map((q) => q.id).filter((id) => isLiked(id)))
  }, [])

  function handleToggleLike(e: React.MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    const nowLiked = toggleLike(id)
    setLikedIds((prev) => (nowLiked ? [...prev, id] : prev.filter((i) => i !== id)))
  }

  function likeCountFor(q: DiscussionQuestion) {
    const base = q.likeCount ?? 0
    return likedIds.includes(q.id) ? base + 1 : base
  }

  const [showComposer, setShowComposer] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [text, setText] = useState('')
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()

  function handleSubmit() {
    if (!text.trim()) return
    requireNickname(() => {
      const q = addQuestion({ bookId: selectedBookId, text: text.trim() })
      setShowComposer(false)
      setText('')
      setSelectedBookId(null)
      router.push(`/social/discuss/${q.id}`)
    })
  }

  return (
    <main className="bj-shell" style={{ minHeight: '100dvh' }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <Link href="/social" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">의견 나누기</span>
      </header>

      <div style={{ paddingBottom: 100, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p className="bj-body" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
          책 읽고 생긴 질문을 남기면 다른 사람이 답해요
        </p>

        <button type="button" onClick={() => setShowComposer(true)} className="bj-btn bj-btn--primary bj-btn--block" style={{ padding: '14px 0' }}>
          질문 남기기
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {questions.map((q) => {
            const author = resolveAuthor(q.authorId)
            const answerCount = loadAnswers(q.id).length
            const liked = likedIds.includes(q.id)
            return (
              <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{bookTitle(q.bookId)}</p>
                  <p className="bj-body" style={{ fontSize: 14, marginBottom: 6 }}>{q.text}</p>
                  <p className="bj-caption">{author.nickname} · 답변 {answerCount}개</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(e, q.id)}
                  aria-label="좋아요"
                  style={{
                    flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: liked ? 'var(--color-action)' : 'var(--color-text-hint)',
                  }}
                >
                  <HeartIcon filled={liked} />
                  <span className="bj-caption" style={{ fontSize: 11, color: 'inherit' }}>{likeCountFor(q)}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </div>

      {showComposer && (
        <div className="bj-sheet__overlay" onClick={() => setShowComposer(false)}>
          <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="bj-h2" style={{ marginBottom: 16 }}>질문 남기기</p>

            <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>어떤 책에 대한 질문인가요?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <button
                type="button"
                onClick={() => setSelectedBookId(null)}
                className={`bj-choice${selectedBookId === null ? ' is-active' : ''}`}
                style={{ fontSize: 13, padding: '10px 12px' }}
              >
                자유주제
              </button>
              {BLIND_BOOKS.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBookId(book.id)}
                  className={`bj-choice${selectedBookId === book.id ? ' is-active' : ''}`}
                  style={{ fontSize: 13, padding: '10px 12px' }}
                >
                  {book.title}
                </button>
              ))}
            </div>

            <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 8 }}>질문 내용</p>
            <textarea
              className="bj-textarea"
              placeholder="궁금한 걸 자유롭게 물어보세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
              style={{ marginBottom: 16 }}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bj-btn bj-btn--primary bj-btn--block"
              style={{ padding: '14px 0', opacity: text.trim() ? 1 : 0.4, cursor: text.trim() ? 'pointer' : 'not-allowed' }}
            >
              등록하기
            </button>
          </div>
        </div>
      )}

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
      </div>
    </main>
  )
}
