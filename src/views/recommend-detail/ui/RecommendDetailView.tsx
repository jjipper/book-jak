'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  loadRecRequest,
  loadRecommendations,
  setRecRequestOpen,
  createRecommendation,
  setReading,
  saveRecReview,
} from '@/entities/recommendation/api/recommendationsRemote'
import { REC_LIMIT_PER_USER, type RecRequest, type Recommendation } from '@/entities/recommendation/model/recommendations'
import type { PostBook } from '@/entities/post/api/postsRemote'
import { bookDetailHref } from '@/entities/external-book/model/aladdinBooks'
import { getMyId } from '@/entities/user/model/profile'
import BookPicker from '@/features/post-compose/ui/BookPicker'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import TypeBadge from '@/shared/ui/TypeBadge'
import Stars from '@/shared/ui/Stars'
import StarRating from '@/shared/ui/StarRating'

function BookChip({ title, isbn, cover }: { title: string; isbn: string | null; cover: string | null }) {
  const inner = (
    <>
      {cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt="" className="bj-post-book__cover" />
      )}
      <span className="bj-post-book__title">{title}</span>
    </>
  )
  return isbn ? (
    <Link href={bookDetailHref(isbn)} className="bj-post-book">{inner}</Link>
  ) : (
    <div className="bj-post-book">{inner}</div>
  )
}

function PersonLink({ id, nickname, typeCode }: { id: string; nickname: string; typeCode?: string | null }) {
  return (
    <Link href={`/people/${id}`} className="bj-post-card__author-link">
      <TypeBadge code={typeCode ?? null} />
      <span className="bj-post-card__author bj-bold">{nickname}</span>
    </Link>
  )
}

interface RecCardProps {
  rec: Recommendation
  myId: string
  onChanged: () => void
  requireAuth: (action: () => void) => void
}

function RecCard({ rec, myId, onChanged, requireAuth }: RecCardProps) {
  const [reviewing, setReviewing] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')

  const myRead = rec.reads.find((r) => r.userId === myId)
  const readingCount = rec.reads.filter((r) => r.review === null).length
  const reviews = rec.reads.filter((r) => r.review !== null)

  function run(action: () => Promise<void>) {
    requireAuth(() => {
      void action().then(onChanged, (e: Error) => toast.error(e.message))
    })
  }

  return (
    <div className="bj-card bj-col-10">
      <BookChip title={rec.bookTitle} isbn={rec.bookIsbn} cover={rec.bookCover} />
      <p className="bj-body">{rec.reason}</p>
      <div className="bj-row-between">
        <PersonLink id={rec.authorId} nickname={rec.authorNickname} typeCode={rec.authorTypeCode} />
        <span className="bj-caption">{readingCount}명이 읽는 중</span>
      </div>

      {reviews.length > 0 && (
        <div className="bj-col-8">
          {reviews.map((r) => (
            <div key={r.userId} className="bj-col-4">
              <div className="bj-meta-row">
                <PersonLink id={r.userId} nickname={r.nickname} />
                {r.rating !== null && <Stars value={r.rating} />}
              </div>
              <p className="bj-body bj-body--sm">{r.review}</p>
            </div>
          ))}
        </div>
      )}

      {!myRead ? (
        <button type="button" className="bj-btn bj-btn--secondary bj-btn--block" onClick={() => run(() => setReading(rec.id, true))}>
          읽을게요
        </button>
      ) : myRead.review === null && (
        reviewing ? (
          <div className="bj-col-8">
            <StarRating value={rating} onChange={setRating} />
            <input
              type="text"
              className="bj-input"
              placeholder="다 읽어보니 어땠나요"
              maxLength={200}
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <button
              type="button"
              className="bj-btn bj-btn--primary bj-btn--block"
              disabled={review.trim().length === 0}
              onClick={() => run(() => saveRecReview(rec.id, rating > 0 ? rating : null, review.trim()))}
            >
              후기 남기기
            </button>
          </div>
        ) : (
          <div className="bj-choice-row">
            <button type="button" className="bj-btn bj-btn--primary bj-choice--flex" onClick={() => setReviewing(true)}>
              다 읽었어요
            </button>
            <button type="button" className="bj-btn bj-btn--text bj-choice--flex" onClick={() => run(() => setReading(rec.id, false))}>
              읽기 취소
            </button>
          </div>
        )
      )}
    </div>
  )
}

export default function RecommendDetailView() {
  const { id } = useParams<{ id: string }>()
  const [req, setReq] = useState<RecRequest | null | false>(null)
  const [recs, setRecs] = useState<Recommendation[]>([])
  const [myId, setMyId] = useState('me')
  const [book, setBook] = useState<PostBook | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()

  const reload = useCallback(
    () => Promise.all([loadRecRequest(id), loadRecommendations(id)]).then(([r, list]) => {
      setReq(r ?? false)
      setRecs(list)
      setMyId(getMyId())
    }),
    [id],
  )

  useEffect(() => { void reload() }, [reload])

  if (req === null || req === false) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-subpage-loading">
            <BackLink href="/social?tab=recommend" />
            {req === false && <p className="bj-caption bj-text-muted">사라진 요청이에요</p>}
          </div>
        </div>
      </main>
    )
  }

  const request = req
  const isMine = request.authorId === myId
  const myRecCount = recs.filter((r) => r.authorId === myId).length

  function toggleOpen() {
    requireAuth(() => {
      void setRecRequestOpen(request.id, !request.isOpen).then(reload, (e: Error) => toast.error(e.message))
    })
  }

  function handleRecommend() {
    if (!book || reason.trim().length < 2 || submitting) return
    requireAuth(() => {
      requireNickname(async () => {
        setSubmitting(true)
        try {
          await createRecommendation(request.id, book, reason.trim())
          setBook(null)
          setReason('')
          await reload()
        } catch (e) {
          toast.error((e as Error).message)
        }
        setSubmitting(false)
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/social?tab=recommend" />
          <span className="bj-h2">책 추천</span>
        </header>

        <div className="bj-content--lg">
          <div className="bj-card bj-col-10">
            <div className="bj-meta-row">
              <span className={`bj-chip${request.isOpen ? ' bj-chip--active' : ''}`}>
                {request.isOpen ? '추천 받는 중' : '닫힘'}
              </span>
            </div>
            <p className="bj-h1">{request.mood}</p>
            <PersonLink id={request.authorId} nickname={request.authorNickname} typeCode={request.typeCode} />
            {request.bookTitle && (
              <div className="bj-col-4">
                <p className="bj-caption">최근 좋았던 책</p>
                <BookChip title={request.bookTitle} isbn={request.bookIsbn} cover={request.bookCover} />
              </div>
            )}
            {isMine && (
              <button type="button" className="bj-btn bj-btn--text bj-btn--block" onClick={toggleOpen}>
                {request.isOpen ? '추천 닫기' : '다시 열기'}
              </button>
            )}
          </div>

          <section className="bj-col-10">
            <p className="bj-h2">추천 {recs.length}</p>
            {recs.length === 0 && <p className="bj-caption bj-text-muted">아직 추천이 없어요. 첫 책을 권해보세요</p>}
            {recs.map((r) => (
              <RecCard key={r.id} rec={r} myId={myId} onChanged={() => void reload()} requireAuth={requireAuth} />
            ))}
          </section>

          {!isMine && (
            !request.isOpen ? (
              <p className="bj-caption bj-text-center">추천이 닫힌 요청이에요</p>
            ) : myRecCount >= REC_LIMIT_PER_USER ? (
              <p className="bj-caption bj-text-center">이 요청에 {REC_LIMIT_PER_USER}권을 모두 추천했어요</p>
            ) : (
              <section className="bj-col-8">
                <p className="bj-h2">이거 읽어봐</p>
                <BookPicker value={book} onChange={setBook} />
                <textarea
                  className="bj-textarea bj-textarea--sm"
                  placeholder="이 책을 권하는 이유"
                  maxLength={300}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <button
                  type="button"
                  className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
                  disabled={!book || reason.trim().length < 2 || submitting}
                  onClick={handleRecommend}
                >
                  추천하기 ({myRecCount}/{REC_LIMIT_PER_USER})
                </button>
              </section>
            )
          )}
        </div>

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/recommend/${id}`} />
      </div>
    </main>
  )
}
