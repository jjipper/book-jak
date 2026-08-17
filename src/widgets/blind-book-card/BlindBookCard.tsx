'use client'

// TODO (Phase 2-2): onSave 시 Supabase blind_reactions 테이블에 'save' 기록
//   테이블: blind_reactions(user_id, blind_book_id, action: 'save'|'pass', created_at)

import { useEffect, useRef, useState } from 'react'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'
import { predictBlindMatch, type BlindMatch } from '@/features/predicted-score/model/predict'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

interface BlindBookCardProps {
  book: BlindBook
  onPass: () => void
  onSave: () => void
}

function MetaRow({ book }: { book: BlindBook }) {
  return (
    <div className="bj-blind-card__meta">
      {book.meta.map((m) => (
        <span key={m.key} className="bj-caption">
          <span className="bj-bold">{m.key}</span> {m.value}
        </span>
      ))}
    </div>
  )
}

export default function BlindBookCard({ book, onPass, onSave }: BlindBookCardProps) {
  const [match, setMatch] = useState<BlindMatch | null>(null)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  useEffect(() => {
    setMatch(predictBlindMatch(book))
  }, [book])

  const cardRef = useRef<HTMLDivElement>(null)
  const leftHintRef = useRef<HTMLSpanElement>(null)
  const rightHintRef = useRef<HTMLSpanElement>(null)
  const exitingRef = useRef(false)

  function triggerPass() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExitDir('left')
  }

  function triggerSave() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExitDir('right')
  }

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (exitDir === 'left') onPass()
    if (exitDir === 'right') onSave()
  }

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
      const threshold = 50
      if (dx < -threshold) {
        left.style.opacity = String(Math.min(1, Math.abs(dx) / 120))
        right.style.opacity = '0'
      } else if (dx > threshold) {
        right.style.opacity = String(Math.min(1, dx / 120))
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
      if (deltaX < -threshold) {
        card!.style.transform = ''
        setHints(0)
        triggerPass()
      } else if (deltaX > threshold) {
        card!.style.transform = ''
        setHints(0)
        triggerSave()
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

  const headline =
    book.desc.find((s) => s.emphasis)?.text ??
    book.desc[0]?.text.split(' ').slice(0, 6).join(' ') ??
    ''

  return (
    <div
      ref={cardRef}
      className="bj-blind-card"
      style={{
        touchAction: 'pan-y',
        cursor: exitDir ? 'default' : 'grab',
        userSelect: 'none',
        ...(exitDir
          ? {
              transform:
                exitDir === 'left'
                  ? 'translateX(-140%) rotate(-14deg)'
                  : 'translateX(140%) rotate(14deg)',
              opacity: 0,
              transition: 'transform .34s cubic-bezier(.4,0,.6,1), opacity .34s',
            }
          : {}),
      }}
      onTransitionEnd={handleTransitionEnd}
    >
      {/* 드래그 힌트 레이블 */}
      <span ref={leftHintRef} className="bj-blind-card__hint bj-blind-card__hint--pass">
        패스
      </span>
      <span ref={rightHintRef} className="bj-blind-card__hint bj-blind-card__hint--save">
        서재에 담기
      </span>

      {/* 히어로 이미지 */}
      <div className="bj-blind-card__hero">
        <IllustPlaceholder
          code={book.illustCode}
          alt="블라인드 책"
          aspectRatio="2 / 3"
          fit="cover"
          className="bj-blind-card__hero-img"
        />
        <div className="bj-blind-card__title-overlay">
          <p className="bj-display bj-display--lg">{headline}</p>
        </div>
      </div>

      {/* 본문 */}
      <div className="bj-blind-card__body">
        {/* AI 매칭도 — 간결하게 */}
        <div className="bj-callout">
          {match ? (
            <p className="bj-body" style={{ fontSize: 13.5 }}>
              나와의 매칭도 <strong>{match.percent}%</strong> — {match.matchedTags.join('·')} 취향 기반
            </p>
          ) : (
            <p className="bj-caption" style={{ opacity: 0.8 }}>
              테스트하거나 로그인하면 이 책과의 예상 매칭도를 확인할 수 있어요
            </p>
          )}
        </div>

        {/* 설명 (토스 말투) */}
        <p className="bj-body bj-blind-card__desc">
          {book.desc.map((seg, i) => (
            <span
              key={i}
              style={seg.emphasis ? { color: 'var(--color-accent)', fontWeight: 700 } : undefined}
            >
              {seg.text}
            </span>
          ))}
        </p>

        {/* 메타 */}
        <MetaRow book={book} />

        {/* 액션 버튼 */}
        <div className="bj-blind-card__actions no-drag">
          <button type="button" onClick={triggerPass} className="bj-btn" style={{ flex: 1 }}>
            패스
          </button>
          <button
            type="button"
            onClick={triggerSave}
            className="bj-btn bj-btn--primary"
            style={{ flex: 1 }}
          >
            서재에 담기
          </button>
        </div>
      </div>
    </div>
  )
}
