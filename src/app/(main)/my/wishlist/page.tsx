'use client'

// 마이 > 보관함 — 읽고 싶어요 한 책

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadWishlist, removeFromWishlist, type WishlistRecord } from '@/lib/wishlist'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

export default function MyWishlistPage() {
  const [items, setItems] = useState<WishlistRecord[]>([])

  useEffect(() => {
    setItems(loadWishlist())
  }, [])

  function handleRemove(bookId: string) {
    removeFromWishlist(bookId)
    setItems((prev) => prev.filter((r) => r.bookId !== bookId))
  }

  return (
    <main style={{ minHeight: '100dvh', paddingBottom: 40 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '52px 20px 16px' }}>
        <Link href="/my" className="bj-icon-btn" style={{ textDecoration: 'none' }}>←</Link>
        <span className="bj-display bj-display--lg">읽고 싶어요</span>
      </header>

      <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {items.length === 0 ? (
          <div className="bj-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 담아둔 책이 없어요</p>
            <p className="bj-caption" style={{ marginBottom: 16 }}>발견 탭에서 궁금한 책을 읽고싶어요로 담아보세요</p>
            <Link href="/discover" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              발견하러 가기
            </Link>
          </div>
        ) : (
          items.map((r) => (
            <div key={r.bookId} className="bj-row" style={{ alignItems: 'stretch', gap: 14 }}>
              <div style={{ width: 52, flexShrink: 0 }}>
                <IllustPlaceholder code={r.illustCode ?? r.bookId} alt={r.title} aspectRatio="3 / 4" />
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 3 }}>
                <p className="bj-body" style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.title}
                </p>
                <p className="bj-caption">
                  {r.author ?? '작자 미상'}{r.publisher ? ` · ${r.publisher}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(r.bookId)}
                className="bj-btn bj-btn--ghost"
                style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', alignSelf: 'center' }}
              >
                빼기
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
