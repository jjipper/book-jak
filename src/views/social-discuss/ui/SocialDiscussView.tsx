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
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

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
    requireAuth(() => {
      const nowLiked = toggleLike(id)
      setLikedIds((prev) => (nowLiked ? [...prev, id] : prev.filter((i) => i !== id)))
    })
  }

  function likeCountFor(q: DiscussionQuestion) {
    const base = q.likeCount ?? 0
    return likedIds.includes(q.id) ? base + 1 : base
  }

  const [showComposer, setShowComposer] = useState(false)
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null)
  const [text, setText] = useState('')
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleSubmit() {
    if (!text.trim()) return
    requireAuth(() => {
      requireNickname(() => {
        const q = addQuestion({ bookId: selectedBookId, text: text.trim() })
        setShowComposer(false)
        setText('')
        setSelectedBookId(null)
        router.push(`/social/discuss/${q.id}`)
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">의견 나누기</span>
      </header>

      <div className="bj-content--discuss">
        <p className="bj-body bj-text-muted bj-text-sm">
          책 읽고 생긴 질문을 남기면 다른 사람이 답해요
        </p>

        <button type="button" onClick={() => setShowComposer(true)} className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall">
          질문 남기기
        </button>

        <div className="bj-col-10">
          {questions.map((q) => {
            const author = resolveAuthor(q.authorId)
            const answerCount = loadAnswers(q.id).length
            const liked = likedIds.includes(q.id)
            return (
              <Link key={q.id} href={`/social/discuss/${q.id}`} className="bj-row bj-row--top bj-unstyled-link">
                <div className="bj-flex-1">
                  <p className="bj-caption bj-bold bj-mb-4">{bookTitle(q.bookId)}</p>
                  <p className="bj-body bj-discuss-text">{q.text}</p>
                  <p className="bj-caption">{author.nickname} · 답변 {answerCount}개</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(e, q.id)}
                  aria-label="좋아요"
                  className={`bj-like-col${liked ? ' bj-like-col--active' : ''}`}
                >
                  <HeartIcon filled={liked} />
                  <span className="bj-caption bj-like-count">{likeCountFor(q)}</span>
                </button>
              </Link>
            )
          })}
        </div>
      </div>

      {showComposer && (
        <div className="bj-sheet__overlay" onClick={() => setShowComposer(false)}>
          <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
            <p className="bj-h2 bj-mb-16">질문 남기기</p>

            <p className="bj-caption bj-bold bj-mb-8">어떤 책에 대한 질문인가요?</p>
            <div className="bj-book-grid">
              <button
                type="button"
                onClick={() => setSelectedBookId(null)}
                className={`bj-choice bj-choice--sm${selectedBookId === null ? ' is-active' : ''}`}
              >
                자유주제
              </button>
              {BLIND_BOOKS.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBookId(book.id)}
                  className={`bj-choice bj-choice--sm${selectedBookId === book.id ? ' is-active' : ''}`}
                >
                  {book.title}
                </button>
              ))}
            </div>

            <p className="bj-caption bj-bold bj-mb-8">질문 내용</p>
            <textarea
              className="bj-textarea bj-textarea--mb"
              placeholder="궁금한 걸 자유롭게 물어보세요"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim()}
              className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
            >
              등록하기
            </button>
          </div>
        </div>
      )}

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
      <LoginGateSheet open={showGate} onClose={closeGate} next="/social/discuss" />
      </div>
    </main>
  )
}
