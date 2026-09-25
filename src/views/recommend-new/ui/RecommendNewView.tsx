'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createRecRequest, createRecommendations } from '@/entities/recommendation/api/recommendationsRemote'
import { REC_LIMIT_PER_USER, type RecKind } from '@/entities/recommendation/model/recommendations'
import type { PostBook } from '@/entities/post/api/postsRemote'
import BookPicker from '@/features/post-compose/ui/BookPicker'
import { useRequireNickname } from '@/features/nickname-gate/hooks/useRequireNickname'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import Icon from '@/shared/ui/Icon'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'

// 두 종류는 같은 폼을 쓰고 카피만 다르다 (DB rec_requests.kind). 종류는 등록 때 정하면 못 바꾼다.
const COPY: Record<RecKind, {
  tab: string; titleLabel: string; titlePlaceholder: string
  descPlaceholder: string; hint: string; submit: string
}> = {
  ask: {
    tab: '추천받기',
    titleLabel: '어떤 책을 찾고 있나요',
    titlePlaceholder: '예: 비 오는 날 읽을 책 추천받아요',
    descPlaceholder: '어떤 분위기를 찾는지, 요즘 뭘 읽었는지, 피하고 싶은 건 뭔지 적어주세요',
    hint: '다른 사람들이 이 목록에 책을 채워줘요. 책은 내가 담지 않아요',
    submit: '추천 받고 싶어요',
  },
  share: {
    tab: '추천하기',
    titleLabel: '목록 제목',
    titlePlaceholder: '예: 울고 싶을 때 보는 책 5선',
    descPlaceholder: '어떤 사람에게 권하는 목록인지, 어떻게 고른 책들인지 적어주세요',
    hint: '다른 사람은 읽을게요·서재에 담기·후기만 남겨요',
    submit: '내 추천 목록 만들기',
  },
}

interface Pick { book: PostBook; reason: string }

export default function RecommendNewView({ kind: initialKind = 'ask' }: { kind?: RecKind }) {
  const router = useRouter()
  const [kind, setKind] = useState<RecKind>(initialKind)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [picks, setPicks] = useState<Pick[]>([])
  const [submitting, setSubmitting] = useState(false)
  const { showNicknameSheet, requireNickname, handleNicknameSubmit, closeNicknameSheet } = useRequireNickname()
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const copy = COPY[kind]

  // ask는 책을 담지 않는다 (DB 트리거가 작성자의 추천을 막는다) — 담은 책은 share일 때만 함께 등록한다
  const books = kind === 'share' ? picks : []
  const reasonsOk = books.every((p) => p.reason.trim().length >= 2)
  const canSubmit = title.trim().length >= 2 && reasonsOk && !submitting

  function addBook(book: PostBook | null) {
    if (!book || picks.length >= REC_LIMIT_PER_USER) return
    setPicks((prev) => [...prev, { book, reason: '' }])
  }

  function handleSubmit() {
    if (!canSubmit) return
    requireAuth(() => {
      requireNickname(async () => {
        setSubmitting(true)
        let id: string
        try {
          id = await createRecRequest(kind, title.trim(), desc.trim())
        } catch (e) {
          toast.error((e as Error).message)
          setSubmitting(false)
          return
        }
        // 요청은 이미 만들어졌다 — 책 담기가 실패해도 상세로 보내고 거기서 다시 담게 한다
        try {
          await createRecommendations(id, books.map((p) => ({ book: p.book, reason: p.reason.trim() })))
        } catch (e) {
          toast.error((e as Error).message)
        }
        router.push(`/social/recommend/${id}`)
      })
    })
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/social?tab=recommend" />
          <span className="bj-h2">추천 쓰기</span>
        </header>

        <div className="bj-content--new">
          <div>
            <p className="bj-caption bj-bold bj-mb-8">무엇을 할까요</p>
            <div className="bj-choice-row" role="tablist">
              {(['share', 'ask'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={kind === k}
                  onClick={() => setKind(k)}
                  className={`bj-choice bj-choice--flex bj-text-center${kind === k ? ' is-active' : ''}`}
                >
                  {COPY[k].tab}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="bj-caption bj-bold bj-mb-8">{copy.titleLabel}</p>
            <input
              type="text"
              className="bj-input"
              placeholder={copy.titlePlaceholder}
              maxLength={40}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className="bj-caption bj-bold bj-mb-8">설명 (선택)</p>
            <textarea
              className="bj-textarea bj-textarea--sm"
              placeholder={copy.descPlaceholder}
              maxLength={500}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          {kind === 'share' && (
            <div className="bj-col-8">
              <p className="bj-caption bj-bold">담을 책 {picks.length}/{REC_LIMIT_PER_USER}</p>
              {picks.map((p, i) => (
                <div key={`${p.book.isbn ?? p.book.title}-${i}`} className="bj-card bj-col-8">
                  <div className="bj-book-pick">
                    {p.book.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.book.cover} alt="" className="bj-book-pick__cover" />
                    )}
                    <p className="bj-body bj-book-pick__title">{p.book.title}</p>
                    <button
                      type="button"
                      className="bj-icon-btn"
                      aria-label="담은 책 빼기"
                      onClick={() => setPicks((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Icon name="x" size={18} />
                    </button>
                  </div>
                  <textarea
                    className="bj-textarea bj-textarea--sm"
                    placeholder="이 책을 권하는 이유"
                    maxLength={300}
                    value={p.reason}
                    onChange={(e) =>
                      setPicks((prev) => prev.map((q, j) => (j === i ? { ...q, reason: e.target.value } : q)))
                    }
                  />
                </div>
              ))}
              {picks.length < REC_LIMIT_PER_USER && <BookPicker value={null} onChange={addBook} />}
            </div>
          )}

          <p className="bj-caption bj-text-muted">{copy.hint} · 내 BOOKBTI가 함께 표시돼요</p>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
          >
            {copy.submit}
          </button>
        </div>

        {showNicknameSheet && <NicknameSheet onSubmit={handleNicknameSubmit} onClose={closeNicknameSheet} />}
        <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/recommend/new?kind=${kind}`} />
      </div>
    </main>
  )
}
