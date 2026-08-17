'use client'

import { useState } from 'react'
import type { Post } from '@/entities/post/model/posts'
import { togglePostLike, isPostLiked } from '@/entities/post/api/postsRemote'

function TypeBadge({ typeCode }: { typeCode: string | null }) {
  if (!typeCode) {
    return <span className="bj-post-card__badge bj-post-card__badge--empty" title="독서 유형 없음" />
  }
  return (
    <span className="bj-post-card__badge" title={typeCode}>
      {typeCode}
    </span>
  )
}

function formatRelTime(ts: number): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '방금'
  if (m < 60) return `${m}분 전`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}시간 전`
  const d = Math.floor(h / 24)
  return `${d}일 전`
}

interface PostCardProps {
  post: Post
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(() => isPostLiked(post.id))
  const [likeCount, setLikeCount] = useState(post.likeCount)

  async function handleLike() {
    const next = !liked
    setLiked(next)
    setLikeCount((c) => c + (next ? 1 : -1))
    await togglePostLike(post.id)
  }

  return (
    <article className="bj-post-card">
      <div className="bj-post-card__header">
        <TypeBadge typeCode={post.authorTypeCode} />
        <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
        <span className="bj-post-card__time bj-caption">{formatRelTime(post.ts)}</span>
      </div>

      <p className="bj-post-card__content bj-body">{post.content}</p>

      {post.bookTitle && (
        <span className="bj-post-card__book-tag bj-caption">
          {post.bookTitle}
        </span>
      )}

      <div className="bj-post-card__footer">
        <button
          type="button"
          onClick={handleLike}
          className={`bj-post-card__like-btn${liked ? ' bj-post-card__like-btn--active' : ''}`}
        >
          <HeartIcon filled={liked} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        {post.commentCount > 0 && (
          <span className="bj-post-card__comment-count bj-caption">
            {post.commentCount}
          </span>
        )}
      </div>
    </article>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
