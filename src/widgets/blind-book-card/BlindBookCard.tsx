'use client'

import { useEffect, useRef, useState } from 'react'
import type { BlindBook } from '@/entities/blind-book/model/blindBooks'
import { REVEAL_COST, TOKEN_EARN_WAYS } from '@/entities/token/model/token'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import './BlindBookCard.css'

interface BlindBookCardProps {
  book: BlindBook
  /** 내 토큰 수. null = 비로그인(공개 버튼은 보이고 누르면 로그인 게이트) */
  tokens: number | null
  onPass: () => void
  onReveal: () => void
}

export default function BlindBookCard({ book, tokens, onPass, onReveal }: BlindBookCardProps) {
  const [exiting, setExiting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)
  const exitingRef = useRef(false)
  const alreadyRevealed = book.status === 'revealed'

  function triggerPass() {
    if (exitingRef.current) return
    exitingRef.current = true
    setExiting(true)
  }

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName === 'transform' && exiting) onPass()
  }

  // 왼쪽으로 밀면 넘어가기. 공개는 토큰을 쓰니 버튼으로만 한다 — 실수로 쓰지 않게.
  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    let dragging = false
    let startX = 0
    let deltaX = 0

    function onPointerDown(e: PointerEvent) {
      if (exitingRef.current || (e.target as HTMLElement).closest('.no-drag')) return
      dragging = true
      startX = e.clientX
      deltaX = 0
      card!.setPointerCapture(e.pointerId)
      card!.style.transition = 'none'
    }
    function onPointerMove(e: PointerEvent) {
      if (!dragging) return
      deltaX = Math.min(0, e.clientX - startX)
      card!.style.transform = `translateX(${deltaX}px) rotate(${deltaX * 0.04}deg)`
      if (hintRef.current) hintRef.current.style.opacity = String(Math.min(1, Math.max(0, -deltaX - 50) / 70))
    }
    function onPointerUp() {
      if (!dragging) return
      dragging = false
      card!.style.transition = ''
      card!.style.transform = ''
      if (hintRef.current) hintRef.current.style.opacity = '0'
      if (deltaX < -100) triggerPass()
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
      className={`bj-blind-card bj-blind-card--fill${exiting ? ' bj-blind-card--exit' : ''}`}
      onTransitionEnd={handleTransitionEnd}
    >
      <span ref={hintRef} className="bj-blind-card__hint bj-blind-card__hint--pass">넘어가기</span>

      <div className="bj-blind-card__hero bj-blind-card__hero--fill">
        <IllustPlaceholder
          code={book.illustCode}
          alt="블라인드 북"
          aspectRatio="auto"
          fit="contain"
          background="transparent"
          className="bj-blind-card__hero-img"
        />
      </div>

      <div className="bj-blind-card__body">
        <p className="bj-blind-card__line">{book.blurb}</p>
        <div className="bj-blind-card__tags">
          {book.tags.map((tag) => (
            <span key={tag} className="bj-chip">#{tag}</span>
          ))}
        </div>

        {tokens === 0 && !alreadyRevealed && (
          <div className="bj-callout no-drag">
            <p className="bj-bold">토큰이 없어요. 이렇게 모을 수 있어요</p>
            {TOKEN_EARN_WAYS.map((w) => (
              <p key={w} className="bj-caption">· {w}</p>
            ))}
          </div>
        )}

        <div className="bj-blind-card__actions no-drag">
          <button type="button" onClick={triggerPass} className="bj-btn bj-btn--secondary">
            넘어가기
          </button>
          {(tokens !== 0 || alreadyRevealed) && (
            <button type="button" onClick={onReveal} className="bj-btn bj-btn--primary">
              {alreadyRevealed ? '공개한 책 보기' : `블라인드 북 공개하기 · 토큰 ${REVEAL_COST}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
