'use client'

// 마이 > 보관함 — 읽고 싶어요 한 책

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadWishlist, removeFromWishlist, type WishlistRecord } from '@/features/wishlist/model/wishlist'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'

export default function MyWishlistView() {
  const [items, setItems] = useState<WishlistRecord[]>([])

  useEffect(() => {
    setItems(loadWishlist())
  }, [])

  function handleRemove(bookId: string) {
    removeFromWishlist(bookId)
    setItems((prev) => prev.filter((r) => r.bookId !== bookId))
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <Link href="/my" className="bj-icon-btn">←</Link>
        <span className="bj-display bj-display--lg">읽고 싶어요</span>
      </header>

      <div className="bj-content">
        {items.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 담아둔 책이 없어요</p>
            <p className="bj-caption bj-mb-16">발견 탭에서 궁금한 책을 읽고싶어요로 담아보세요</p>
            <Link href="/discover" className="bj-btn bj-btn--primary bj-btn--cta">
              발견하러 가기
            </Link>
          </div>
        ) : (
          items.map((r) => (
            <div key={r.bookId} className="bj-row bj-wishlist-row">
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
              <button
                type="button"
                onClick={() => handleRemove(r.bookId)}
                className="bj-btn bj-btn--ghost bj-btn--remove"
              >
                빼기
              </button>
            </div>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
