'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadLikedPosts } from '@/entities/post/api/myPostsRemote'
import type { Post } from '@/entities/post/model/posts'
import { formatRelTime } from '@/entities/post/model/relTime'
import { Icon, SubpageHead, TypeBadge } from '@/shared/ui'

export default function MyLikesView() {
  const [posts, setPosts] = useState<Post[] | null>(null)

  useEffect(() => {
    void loadLikedPosts().then(setPosts)
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <SubpageHead title="좋아요 한 글" backHref="/my" />

      <div className="bj-content">
        {posts === null ? (
          <p className="bj-caption bj-text-muted">불러오는 중…</p>
        ) : posts.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 좋아요 한 글이 없어요</p>
            <Link href="/home" className="bj-btn bj-btn--primary bj-btn--cta">
              피드 둘러보기
            </Link>
          </div>
        ) : (
          posts.map((p) => (
            <article key={p.id} className="bj-post-card">
              <div className="bj-post-card__header">
                <TypeBadge code={p.authorTypeCode} />
                <span className="bj-post-card__author">{p.authorNickname}</span>
                <span className="bj-post-card__time">{formatRelTime(p.ts)}</span>
              </div>
              <Link href={`/posts/${p.id}`} className="bj-post-card__link">
                <div className="bj-post-card__body">
                  <p className="bj-post-card__content bj-clamp-3">{p.content}</p>
                  {p.bookTitle && (
                    <span className="bj-post-book bj-post-book--aside">
                      <span className="bj-post-book__title">{p.bookTitle}</span>
                    </span>
                  )}
                </div>
              </Link>
              <div className="bj-post-card__footer">
                <span className="bj-post-card__like-btn"><Icon name="heart" size={16} />{p.likeCount}</span>
                <span className="bj-post-card__comment-count"><Icon name="comment" size={16} />{p.commentCount}</span>
              </div>
            </article>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
