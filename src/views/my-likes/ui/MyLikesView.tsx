'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadLikedPosts } from '@/entities/post/api/myPostsRemote'
import type { Post } from '@/entities/post/model/posts'
import BackLink from '@/shared/ui/BackLink'

export default function MyLikesView() {
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    void loadLikedPosts().then(setPosts)
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">좋아요 한 글</span>
      </header>

      <div className="bj-content">
        {posts === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">좋아요 한 글이 없어요</p>
            <Link href="/home" className="bj-btn bj-btn--primary bj-btn--cta">
              피드 보러가기
            </Link>
          </div>
        ) : (
          posts.map((p) => (
            <Link key={p.id} href={`/posts/${p.id}`} className="bj-row bj-row--top bj-unstyled-link">
              <div className="bj-flex-1">
                {p.bookTitle && <p className="bj-caption bj-bold bj-mb-4">{p.bookTitle}</p>}
                <p className="bj-body bj-body--sm bj-mb-6">{p.content}</p>
                <p className="bj-caption">{p.authorNickname} · 댓글 {p.commentCount}개</p>
              </div>
            </Link>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
