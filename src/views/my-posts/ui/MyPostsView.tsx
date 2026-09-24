'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadMyPosts } from '@/entities/post/api/myPostsRemote'
import type { Post } from '@/entities/post/model/posts'
import BackLink from '@/shared/ui/BackLink'

export default function MyPostsView() {
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    void loadMyPosts().then(setPosts)
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">남긴 글</span>
      </header>

      <div className="bj-content">
        {posts === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 남긴 글이 없어요</p>
            <Link href="/posts/new" className="bj-btn bj-btn--primary bj-btn--cta">
              글 쓰러 가기
            </Link>
          </div>
        ) : (
          posts.map((p) => (
            <Link key={p.id} href={`/posts/${p.id}`} className="bj-row bj-row--top bj-unstyled-link">
              <div className="bj-flex-1">
                {p.bookTitle && <p className="bj-caption bj-bold bj-mb-4">{p.bookTitle}</p>}
                <p className="bj-body bj-body--sm bj-mb-6 bj-clamp-3">{p.content}</p>
                <p className="bj-caption">좋아요 {p.likeCount} · 댓글 {p.commentCount}</p>
              </div>
            </Link>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
