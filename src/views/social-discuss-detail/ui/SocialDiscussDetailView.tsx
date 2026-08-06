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
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

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
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    async function load() {
      setQuestion((await loadQuestion(params.id)) ?? null)
      setAnswers(await loadAnswers(params.id))
      setLiked(isLiked(params.id))
    }
    void load()
  }, [params.id])

  function handleToggleLike() {
    requireAuth(() => {
      void toggleLike(params.id).then((nowLiked) => setLiked(nowLiked))
    })
  }

  function handleSubmit() {
    if (!text.trim()) return
    requireAuth(() => {
      requireNickname(async () => {
        await addAnswer(params.id, text.trim())
        setAnswers(await loadAnswers(params.id))
        setText('')
      })
    })
  }

  if (!question) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-subpage-loading">
            <Link href="/social/discuss" className="bj-icon-btn">←</Link>
          </div>
        </div>
      </main>
    )
  }

  const author = resolveAuthor(question.authorId)

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/social/discuss" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">{bookTitle(question.bookId)}</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-callout">
          <p className="bj-callout__body">{question.text}</p>
          <div className="bj-row-between">
            <p className="bj-caption bj-callout__author">{author.nickname}</p>
            <button
              type="button"
              onClick={handleToggleLike}
              aria-label="좋아요"
              className="bj-like-btn"
              style={{ opacity: liked ? 1 : 0.7 }}
            >
              <HeartIcon filled={liked} />
              <span className="bj-caption">{(question.likeCount ?? 0) + (liked ? 1 : 0)}</span>
            </button>
          </div>
        </div>

        <p className="bj-caption bj-bold">답변 {answers.length}개</p>

        <div className="bj-col-10">
          {answers.map((a) => {
            const answerAuthor = resolveAuthor(a.authorId)
            return (
              <div key={a.id} className="bj-row bj-row--top">
                <div className="bj-flex-1">
                  <p className="bj-body bj-answer-text">{a.text}</p>
                  <p className="bj-caption">{answerAuthor.nickname}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="bj-col-10">
          <textarea
            className="bj-textarea bj-textarea--sm"
            placeholder="답변을 남겨보세요"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim()}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
          >
            답변 등록
          </button>
        </div>
      </div>

      {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/discuss/${params.id}`} />
      </div>
    </main>
  )
}
