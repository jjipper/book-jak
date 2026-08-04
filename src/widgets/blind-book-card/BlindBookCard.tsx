'use client'

import { useEffect, useRef, useState } from 'react'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'
import { predictBlindMatch, type BlindMatch } from '@/features/predicted-score/model/predict'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface BlindBookCardProps {
  book: BlindBook
  onSkip: () => void // 제 취향 아니에요
  onCurious: () => void // 궁금해요 → 책 정보 공개
  onWish: () => void // 읽고싶어요 저장 후 다음
  onNext: () => void
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function MetaGrid({ book }: { book: BlindBook }) {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: `repeat(${book.meta.length}, 1fr)`, gap: 8,
        padding: '12px 0',
        borderTop: '1px dashed var(--color-border)', borderBottom: '1px dashed var(--color-border)',
      }}
    >
      {book.meta.map((m) => (
        <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span className="bj-caption bj-bold" style={{ letterSpacing: '0.06em' }}>{m.key}</span>
          <span className="bj-body" style={{ fontSize: 13, fontWeight: 700 }}>{m.value}</span>
        </div>
      ))}
    </div>
  )
}

function TagChips({ book }: { book: BlindBook }) {
  return (
    <div className="bj-tag-group">
      {book.tags.map((tag) => (
        <span key={tag.text} className={tag.kind === 'primary' ? 'bj-chip bj-chip--active' : 'bj-chip'}>
          {tag.text}
        </span>
      ))}
    </div>
  )
}

function Hints({ book, count }: { book: BlindBook; count: number }) {
  return (
    <div>
      <p className="bj-caption bj-bold" style={{ letterSpacing: '0.1em', marginBottom: 8 }}>
        먼저 읽은 사람들의 후기
      </p>
      <div className="bj-col-10" style={{ gap: 8 }}>
        {book.hints.slice(0, count).map((hint, i) => (
          <div key={i} className="bj-callout bj-callout--muted">
            &ldquo;{hint}&rdquo;
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BlindBookCard({ book, onSkip, onCurious, onWish, onNext }: BlindBookCardProps) {
  const [revealed, setRevealed] = useState(false)
  const [match, setMatch] = useState<BlindMatch | null>(null)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  // 매칭도는 localStorage 기반이라 마운트 후 계산 (SSR 불일치 방지)
  useEffect(() => {
    setMatch(predictBlindMatch(book))
  }, [book])

  const cardRef = useRef<HTMLDivElement>(null)
  const leftHintRef = useRef<HTMLSpanElement>(null)
  const rightHintRef = useRef<HTMLSpanElement>(null)
  const revealedRef = useRef(revealed)
  const exitingRef = useRef(false)

  useEffect(() => {
    revealedRef.current = revealed
  }, [revealed])

  function handleCurious() {
    setRevealed(true)
    onCurious()
  }

  function triggerSkip() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExitDir('left')
  }

  function triggerNext() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExitDir('right')
  }

  function handleWish() {
    onWish()
    triggerNext()
  }

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (exitDir === 'left') onSkip()
    if (exitDir === 'right') onNext()
  }

  // ── 드래그 제스처: 왼쪽 = 제 취향 아니에요, 오른쪽 = (공개 후) 다음 책 ──
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let dragging = false
    let startX = 0
    let deltaX = 0

    function setHints(dx: number) {
      const left = leftHintRef.current
      const right = rightHintRef.current
      if (!left || !right) return
      const threshold = 60
      if (dx < -threshold && !revealedRef.current) {
        left.style.opacity = String(Math.min(1, Math.abs(dx) / 140))
        right.style.opacity = '0'
      } else if (dx > threshold && revealedRef.current) {
        right.style.opacity = String(Math.min(1, dx / 140))
        left.style.opacity = '0'
      } else {
        left.style.opacity = '0'
        right.style.opacity = '0'
      }
    }

    function onPointerDown(e: PointerEvent) {
      if (exitingRef.current) return
      if ((e.target as HTMLElement).closest('.no-drag')) return
      dragging = true
      startX = e.clientX
      deltaX = 0
      card!.setPointerCapture(e.pointerId)
      card!.style.transition = 'none'
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return
      deltaX = e.clientX - startX
      const rotate = deltaX * 0.04
      card!.style.transform = `translateX(${deltaX}px) rotate(${rotate}deg)`
      setHints(deltaX)
    }
    function onPointerUp() {
      if (!dragging) return
      dragging = false
      card!.style.transition = ''
      const threshold = 100
      if (deltaX < -threshold && !revealedRef.current) {
        card!.style.transform = ''
        setHints(0)
        triggerSkip()
      } else if (deltaX > threshold && revealedRef.current) {
        card!.style.transform = ''
        setHints(0)
        triggerNext()
      } else {
        card!.style.transform = ''
        setHints(0)
      }
    }

    card.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      card.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className="bj-card"
      style={{
        position: 'relative',
        touchAction: 'pan-y',
        cursor: exitDir ? 'default' : 'grab',
        userSelect: 'none',
        ...(exitDir
          ? {
              transform: exitDir === 'left' ? 'translateX(-140%) rotate(-14deg)' : 'translateX(140%) rotate(14deg)',
              opacity: 0,
              transition: 'transform .34s cubic-bezier(.4,0,.6,1), opacity .34s',
            }
          : {}),
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* 드래그 힌트 — opacity는 JS로 직접 제어 (동적) */}
      <span
        ref={leftHintRef}
        style={{
          position: 'absolute', top: 14, left: 14, zIndex: 5,
          padding: '5px 12px', borderRadius: 'var(--radius-badge)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          border: '1.5px solid var(--color-border-strong)',
          background: 'var(--color-surface)', color: 'var(--color-text-hint)',
          opacity: 0, pointerEvents: 'none',
        }}
      >
        제 취향 아니에요
      </span>
      <span
        ref={rightHintRef}
        style={{
          position: 'absolute', top: 14, right: 14, zIndex: 5,
          padding: '5px 12px', borderRadius: 'var(--radius-badge)',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.08em',
          border: '1.5px solid var(--color-action)',
          background: 'var(--color-action-tint)', color: 'var(--color-action-on-tint)',
          opacity: 0, pointerEvents: 'none',
        }}
      >
        넘어갈래요
      </span>

      {!revealed ? (
        /* ── 공개 전: 설명 → 장르/분위기/난이도 → 키워드 → 후기 → 선택 버튼 ── */
        <div className="bj-col-16" style={{ gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-text-hint)' }}>
            <LockIcon />
            <span className="bj-caption bj-bold" style={{ letterSpacing: '0.1em' }}>
              제목·표지는 궁금해요를 누르면 공개돼요
            </span>
          </div>

          {/* AI 추천 — 매칭도 + 취향 근거 추천 문단 */}
          <div className="bj-callout">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <span className="bj-caption" style={{ fontWeight: 800, letterSpacing: '0.12em', color: 'inherit' }}>AI 추천</span>
              {match && (
                <span style={{ fontWeight: 800, fontSize: 15 }}>나와의 매칭도 {match.percent}%</span>
              )}
            </div>
            <p className="bj-body" style={{ fontSize: 13.5, lineHeight: 1.65, color: 'inherit' }}>
              {book.aiPitch}
            </p>
            {match && (
              <p className="bj-caption" style={{ color: 'inherit', opacity: 0.75, marginTop: 6 }}>
                내가 좋아한 &lsquo;{match.matchedTags.join(', ')}&rsquo; 취향 기준 · 내 평가 {match.sampleCount}개 근거
              </p>
            )}
          </div>

          <p className="bj-body" style={{ fontSize: 15, lineHeight: 1.7 }}>
            {book.desc.map((seg, i) => (
              <span key={i} style={seg.emphasis ? { color: 'var(--color-action)', fontWeight: 700 } : undefined}>
                {seg.text}
              </span>
            ))}
          </p>

          <MetaGrid book={book} />
          <TagChips book={book} />
          <Hints book={book} count={3} />

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }} className="no-drag">
            <button type="button" onClick={triggerSkip} className="bj-btn" style={{ flex: 1, padding: '14px 0' }}>
              제 취향 아니에요
            </button>
            <button type="button" onClick={handleCurious} className="bj-btn bj-btn--primary" style={{ flex: 1, padding: '14px 0' }}>
              궁금해요
            </button>
          </div>
        </div>
      ) : (
        /* ── 공개 후: 책 정보 → 매칭도(+AI 메시지) → 줄거리 → 메타 → 키워드 → 후기 → 버튼 ── */
        <div className="bj-col-16">
          <div className="bj-book-head" style={{ gap: 14 }}>
            <div style={{ width: 88, flexShrink: 0 }}>
              <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 4" />
            </div>
            <div className="bj-book-head__body" style={{ justifyContent: 'center' }}>
              <h2 className="bj-h2" style={{ fontSize: 20, lineHeight: 1.25 }}>{book.title}</h2>
              <p className="bj-body bj-bold" style={{ fontSize: 14, marginTop: 4 }}>{book.author}</p>
              <p className="bj-caption" style={{ marginTop: 1 }}>{book.publisher}</p>
            </div>
          </div>

          <div className="bj-callout">
            {match ? (
              <>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                  <span className="bj-bold">나와의 예상 매칭도</span>
                  <span className="bj-display" style={{ fontSize: 24, lineHeight: 1 }}>{match.percent}%</span>
                </div>
                <p className="bj-caption" style={{ color: 'inherit', opacity: 0.85 }}>
                  내가 좋아한 &lsquo;{match.matchedTags.join(', ')}&rsquo; 취향과 겹쳐요 (내 평가 {match.sampleCount}개 근거)
                </p>
              </>
            ) : (
              <>
                <p className="bj-bold" style={{ marginBottom: 4 }}>나와의 예상 매칭도</p>
                <p className="bj-caption" style={{ color: 'inherit', opacity: 0.85 }}>
                  아직 데이터가 부족해요. 카드를 몇 장 더 고르면 매칭도를 계산해드릴게요.
                </p>
              </>
            )}
            <p className="bj-caption" style={{ color: 'inherit', marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--color-border)' }}>
              {book.revealMsg}
            </p>
          </div>

          <div>
            <p className="bj-caption bj-bold" style={{ letterSpacing: '0.1em', marginBottom: 6 }}>줄거리</p>
            <p className="bj-body" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--color-text-muted)' }}>
              {book.synopsis}
            </p>
          </div>

          <MetaGrid book={book} />
          <TagChips book={book} />
          <Hints book={book} count={4} />

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }} className="no-drag">
            <button type="button" onClick={handleWish} className="bj-btn bj-btn--primary" style={{ flex: 1, padding: '14px 0' }}>
              읽고싶어요
            </button>
            <button type="button" onClick={triggerNext} className="bj-btn" style={{ flex: 1, padding: '14px 0' }}>
              넘어갈래요
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
