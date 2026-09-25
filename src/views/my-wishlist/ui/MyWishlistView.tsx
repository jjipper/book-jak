'use client'

// 마이 > 내 서재 — 서재에 담은 책

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { loadWishlist, removeFromWishlist, syncWishlist, type WishlistRecord } from '@/features/wishlist/model/wishlist'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { useMounted } from '@/shared/lib/useMounted'
import BackLink from '@/shared/ui/BackLink'

export default function MyWishlistView() {
  const mounted = useMounted()
  const [removed, setRemoved] = useState<string[]>([])
  const [synced, setSynced] = useState(0)
  // 서버의 서재를 내려받아 로컬 사본을 맞춘다 (기기 바뀌어도 유지, 기존 로컬 항목은 첫 sync 때 이관)
  useEffect(() => {
    void syncWishlist().then(() => setSynced((n) => n + 1))
  }, [])
  const items: WishlistRecord[] = useMemo(
    () => (mounted ? loadWishlist().filter((r) => !removed.includes(r.bookId)) : []),
    // synced가 바뀌면 로컬 사본을 다시 읽는다
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, removed, synced],
  )

  function handleRemove(bookId: string) {
    removeFromWishlist(bookId)
    setRemoved((prev) => [...prev, bookId])
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">서재에 담은 책</span>
      </header>

      <div className="bj-content">
        {!mounted ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : items.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 서재에 담은 책이 없어요</p>
            <p className="bj-caption bj-mb-16">발견 탭이나 책 상세에서 궁금한 책을 담아두세요</p>
            <Link href="/discover" className="bj-btn bj-btn--primary bj-btn--cta">
              발견하러 가기
            </Link>
          </div>
        ) : (
          items.map((r) => {
            const body = (
              <>
                <div className="bj-book-cover">
                  <IllustPlaceholder code={r.illustCode ?? r.bookId} alt={r.title} aspectRatio="3 / 4" />
                </div>
                <div className="bj-book-info bj-flex-1">
                  <p className="bj-body bj-bold bj-truncate bj-body--sm">
                    {r.title}
                  </p>
                  <p className="bj-caption">
                    {r.author ?? '작자 미상'}{r.publisher ? ` · ${r.publisher}` : ''}
                  </p>
                </div>
              </>
            )
            return (
            <div key={r.bookId} className="bj-row bj-wishlist-row">
              {/* 'blind-{id}'는 상세 페이지가 없는 블라인드 책이라 링크 없음 — Phase 2에서 실제 책으로 교체 예정 */}
              {r.bookId.startsWith('isbn-') ? (
                <Link href={`/rate/books/${r.bookId}`} className="bj-unstyled-link bj-wishlist-row bj-flex-1">
                  {body}
                </Link>
              ) : body}
              <button
                type="button"
                onClick={() => handleRemove(r.bookId)}
                className="bj-btn bj-btn--ghost bj-btn--remove"
              >
                빼기
              </button>
            </div>
            )
          })
        )}
      </div>
      </div>
    </main>
  )
}
