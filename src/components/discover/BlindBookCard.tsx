'use client'

import { useEffect, useRef, useState } from 'react'
import type { BlindBook } from '@/data/blindBooks'
import { BLIND_REACTIONS } from '@/data/blindBooks'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'
import StarRating from './StarRating'

interface BlindBookCardProps {
  book: BlindBook
  onSkip: () => void
  onReveal: (stars: number, reactions: string[]) => void
  onNext: () => void
}

function LockIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-hint)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

const TAG_CLASS: Record<BlindBook['tags'][number]['kind'], string> = {
  primary: 'bj-chip bj-chip--active',
  mood: 'bj-chip',
  genre: 'bj-chip',
}

export default function BlindBookCard({ book, onSkip, onReveal, onNext }: BlindBookCardProps) {
  const [stars, setStars] = useState(0)
  const [reactions, setReactions] = useState<string[]>([])
  const [revealed, setRevealed] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  const cardRef = useRef<HTMLDivElement>(null)
  const leftHintRef = useRef<HTMLSpanElement>(null)
  const rightHintRef = useRef<HTMLSpanElement>(null)
  const revealedRef = useRef(revealed)
  const exitingRef = useRef(false)

  useEffect(() => {
    revealedRef.current = revealed
  }, [revealed])

  function toggleReaction(key: string) {
    setReactions((prev) => (prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]))
  }

  function handleSubmitRating() {
    if (stars === 0) return
    onReveal(stars, reactions)
    setRevealed(true)
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

  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.propertyName !== 'transform') return
    if (exitDir === 'left') onSkip()
    if (exitDir === 'right') onNext()
  }

  // ── 드래그 제스처: 왼쪽 = 패스, 오른쪽 = (공개 후) 다음 책 ──
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
      if (dx < -threshold) {
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
      if (deltaX < -threshold) {
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
      {/* 드래그 힌트 */}
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
        패스
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
        읽고 싶어요
      </span>

      {/* 표지 영역 */}
      <div style={{ marginBottom: 16 }}>
        {revealed ? (
          <IllustPlaceholder code={book.illustCode} alt={book.title} aspectRatio="3 / 2" />
        ) : (
          <div
            className="bj-illust"
            style={{
              aspectRatio: '3 / 2', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <LockIcon />
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em' }}>
              평가 후 공개
            </span>
          </div>
        )}
      </div>

      {revealed && (
        <div style={{ marginBottom: 16 }}>
          <h2 className="bj-h2">{book.title}</h2>
          <p className="bj-caption" style={{ marginTop: 2 }}>{book.author}</p>
        </div>
      )}

      {/* 태그 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {book.tags.map((tag) => (
          <span key={tag.text} className={TAG_CLASS[tag.kind]}>{tag.text}</span>
        ))}
      </div>

      {/* 설명 */}
      <p className="bj-body" style={{ marginBottom: 16 }}>
        {book.desc.map((seg, i) => (
          <span key={i} style={seg.emphasis ? { color: 'var(--color-action)', fontWeight: 700 } : undefined}>
            {seg.text}
          </span>
        ))}
      </p>

      {/* 메타 */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: `repeat(${book.meta.length}, 1fr)`, gap: 8,
          padding: '12px 0', marginBottom: 16,
          borderTop: '1px dashed var(--color-border)', borderBottom: '1px dashed var(--color-border)',
        }}
      >
        {book.meta.map((m) => (
          <div key={m.key} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.06em' }}>{m.key}</span>
            <span className="bj-body" style={{ fontSize: 13, fontWeight: 700 }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* 먼저 읽은 사람들의 후기 */}
      <div style={{ marginBottom: 18 }}>
        <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
          먼저 읽은 사람들의 후기
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {book.hints.map((hint, i) => (
            <div key={i} className="bj-callout bj-callout--muted">
              &ldquo;{hint}&rdquo;
            </div>
          ))}
        </div>
      </div>

      {!revealed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
              이 책, 읽고 싶은가요?
            </p>
            <div className="no-drag">
              <StarRating value={stars} onChange={setStars} />
            </div>
          </div>
          <div>
            <p className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
              읽는다면 어떨 것 같아요?
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }} className="no-drag">
              {BLIND_REACTIONS.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => toggleReaction(r.key)}
                  className={`bj-chip${reactions.includes(r.key) ? ' bj-chip--active' : ''}`}
                  style={{ border: '1px solid var(--color-border)', cursor: 'pointer' }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }} className="no-drag">
            <button type="button" onClick={triggerSkip} className="bj-btn" style={{ flex: 1 }}>
              패스
            </button>
            <button
              type="button"
              onClick={handleSubmitRating}
              disabled={stars === 0}
              className="bj-btn bj-btn--primary"
              style={{ flex: 2, opacity: stars === 0 ? 0.4 : 1, cursor: stars === 0 ? 'not-allowed' : 'pointer' }}
            >
              공개하기
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="bj-callout">{book.revealMsg}</div>
          <button type="button" onClick={triggerNext} className="bj-btn bj-btn--primary bj-btn--block no-drag" style={{ padding: '14px 0' }}>
            다음 책
          </button>
        </div>
      )}
    </div>
  )
}
