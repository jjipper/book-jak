'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadMyComments } from '@/entities/post/api/commentsRemote'
import type { PostComment } from '@/entities/post/model/comments'
import BackLink from '@/shared/ui/BackLink'

export default function MyCommentsView() {
  const [comments, setComments] = useState<PostComment[] | null>(null)

  useEffect(() => {
    void loadMyComments().then(setComments)
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">남긴 댓글</span>
      </header>

      <div className="bj-content">
        {comments === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : comments.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 남긴 댓글이 없어요</p>
            <Link href="/home" className="bj-btn bj-btn--primary bj-btn--cta">
              피드 둘러보기
            </Link>
          </div>
        ) : (
          comments.map((c) => (
            <Link key={c.id} href={`/posts/${c.postId}`} className="bj-row bj-row--top bj-unstyled-link">
              <div className="bj-flex-1">
                <p className="bj-body bj-body--sm bj-clamp-3">{c.content}</p>
              </div>
            </Link>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
