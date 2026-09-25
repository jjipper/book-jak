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
  markRecSaved,
} from '@/entities/recommendation/api/recommendationsRemote'
import {
  REC_LIMIT_PER_USER,
  REC_KIND_LABEL,
  type RecKind,
  type RecRequest,
  type Recommendation,
} from '@/entities/recommendation/model/recommendations'
import type { PostBook } from '@/entities/post/api/postsRemote'
import { bookDetailHref } from '@/entities/external-book/model/aladdinBooks'
import { getBookRating, saveBookRating, removeBookRating } from '@/entities/book-rating/model/bookRatings'
import { pushRating, deleteRating } from '@/entities/book-rating/api/ratingsRemote'
import { addToWishlist, loadWishlist } from '@/features/wishlist/model/wishlist'
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

/** 추천자 한 줄 — 제목이 주인공이므로 항상 보조 크기(caption) */
function PersonLink({ id, nickname, typeCode }: { id: string; nickname: string; typeCode?: string | null }) {
  return (
    <Link href={`/people/${id}`} className="bj-post-card__author-link">
      <TypeBadge code={typeCode ?? null} />
      <span className="bj-caption bj-bold">{nickname}</span>
    </Link>
  )
}

interface RecCardProps {
  rec: Recommendation
  /** share 목록에선 모든 책의 추천자가 작성자 한 명이라 카드마다 반복하지 않는다 */
  showAuthor: boolean
  myId: string
  onChanged: () => void
  requireAuth: (action: () => void) => void
}

function RecCard({ rec, showAuthor, myId, onChanged, requireAuth }: RecCardProps) {
  const [reviewing, setReviewing] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  // 서재·별점은 isbn이 있어야 책을 식별할 수 있다 (평가 탭과 같은 'isbn-{isbn13}' 키)
  const bookId = rec.bookIsbn ? `isbn-${rec.bookIsbn}` : null
  const [saved, setSaved] = useState(
    () => rec.savedBy.includes(myId) || (!!bookId && loadWishlist().some((w) => w.bookId === bookId)),
  )
  const [stars, setStars] = useState(() => (bookId ? getBookRating(bookId)?.stars ?? 0 : 0))

  const myRead = rec.reads.find((r) => r.userId === myId)
  const readingCount = rec.reads.filter((r) => r.review === null).length
  const reviews = rec.reads.filter((r) => r.review !== null)

  function handleSave() {
    if (!bookId) return
    requireAuth(() => {
      addToWishlist({ bookId, title: rec.bookTitle, cover: rec.bookCover ?? undefined, ts: Date.now() })
      setSaved(true)
      toast.show('서재에 담았어요')
      // 담은 수는 서버 집계(rec_saves) — 중복 담기는 PK가 막는다
      markRecSaved(rec.id).then(onChanged, () => {})
    })
  }

  // 이미 읽은 책 — 그 자리에서 별점. 평가 탭과 같은 저장 경로(로컬 사본 + 서버 업서트)를 쓴다.
  function handleRate(n: number) {
    if (!bookId) return
    requireAuth(() => {
      setStars(n)
      if (n === 0) {
        removeBookRating(bookId)
        deleteRating(bookId).catch(() => {})
        return
      }
      saveBookRating({ bookId, title: rec.bookTitle, stars: n, review: getBookRating(bookId)?.review, ts: Date.now() })
      pushRating({ id: bookId, title: rec.bookTitle, thumbnail: rec.bookCover ?? undefined }, n).catch(() => {})
      toast.show('별점을 남겼어요')
    })
  }

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
        {showAuthor
          ? <PersonLink id={rec.authorId} nickname={rec.authorNickname} typeCode={rec.authorTypeCode} />
          : <span />}
        <span className="bj-meta-row">
          <span className="bj-caption">읽는 중 {readingCount}명</span>
          <span className="bj-caption">담음 {rec.savedBy.length}명</span>
        </span>
      </div>

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

      {bookId && (
        <div className="bj-row-between">
          <button type="button" className="bj-btn bj-btn--text" onClick={handleSave} disabled={saved}>
            {saved ? '서재에 담김' : '서재에 담기'}
          </button>
          <div className="bj-meta-row">
            <span className="bj-caption">이미 읽었어요</span>
            <StarRating value={stars} onChange={handleRate} size={20} />
          </div>
        </div>
      )}

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
    </div>
  )
}

// 두 종류는 같은 화면을 쓰고 카피만 다르다
const COPY: Record<RecKind, { head: string; books: string; empty: string; compose: string; submit: string }> = {
  ask: {
    head: '추천 요청',
    books: '추천받은 책',
    empty: '아직 추천이 없어요. 첫 책을 권해보세요',
    compose: '책 추천하기',
    submit: '추천하기',
  },
  share: {
    head: '추천 목록',
    books: '이 목록의 책',
    empty: '아직 담긴 책이 없어요',
    compose: '책 담기',
    submit: '책 담기',
  },
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
            {req === false && <p className="bj-caption bj-text-muted">삭제됐거나 없는 목록이에요</p>}
          </div>
        </div>
      </main>
    )
  }

  const request = req
  const copy = COPY[request.kind]
  const isShare = request.kind === 'share'
  const isMine = request.authorId === myId
  const myRecCount = recs.filter((r) => r.authorId === myId).length
  // share는 작성자만, ask는 작성자 말고 다른 사람만 책을 담는다 (DB 트리거와 같은 규칙)
  const canAdd = (isShare ? isMine : !isMine) && request.isOpen && myRecCount < REC_LIMIT_PER_USER

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
          <span className="bj-h2">{copy.head}</span>
        </header>

        <div className="bj-content--lg">
          {/* 타이틀이 주인공 → 추천자는 그 아래 보조 한 줄 */}
          <div className="bj-card bj-col-10">
            <div className="bj-meta-row">
              <span className={`bj-chip${isShare ? ' bj-chip--active' : ''}`}>{REC_KIND_LABEL[request.kind]}</span>
              {!isShare && !request.isOpen && <span className="bj-chip bj-chip--done">닫힘</span>}
            </div>
            <p className="bj-h1">{request.title}</p>
            <PersonLink id={request.authorId} nickname={request.authorNickname} typeCode={request.typeCode} />
            {request.mood && <p className="bj-body">{request.mood}</p>}
            <div className="bj-col-4">
              <p className="bj-caption bj-row-between"><span>담긴 책</span><span className="bj-bold">{request.recCount}권</span></p>
              <p className="bj-caption bj-row-between"><span>읽는 중</span><span className="bj-bold">{request.readerCount}명</span></p>
              <p className="bj-caption bj-row-between"><span>서재에 담음</span><span className="bj-bold">{request.savedCount}명</span></p>
            </div>
            {isMine && !isShare && (
              <button type="button" className="bj-btn bj-btn--text bj-btn--block" onClick={toggleOpen}>
                {request.isOpen ? '추천 닫기' : '다시 열기'}
              </button>
            )}
          </div>

          <section className="bj-col-10">
            <p className="bj-h2">{copy.books} {recs.length}권</p>
            {recs.length === 0 && <p className="bj-caption bj-text-muted">{copy.empty}</p>}
            {recs.map((r) => (
              <RecCard
                key={r.id}
                rec={r}
                showAuthor={!isShare}
                myId={myId}
                onChanged={() => void reload()}
                requireAuth={requireAuth}
              />
            ))}
          </section>

          {canAdd ? (
            <section className="bj-col-8">
              <p className="bj-h2">{copy.compose}</p>
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
                {copy.submit} ({myRecCount}/{REC_LIMIT_PER_USER})
              </button>
            </section>
          ) : isShare ? null : !request.isOpen ? (
            <p className="bj-caption bj-text-center">추천이 닫힌 요청이에요</p>
          ) : !isMine && myRecCount >= REC_LIMIT_PER_USER ? (
            <p className="bj-caption bj-text-center">이 목록에 {REC_LIMIT_PER_USER}권을 모두 추천했어요</p>
          ) : null}
        </div>

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/recommend/${id}`} />
      </div>
    </main>
  )
}
