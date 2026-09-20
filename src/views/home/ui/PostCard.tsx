'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/entities/post/model/posts'
import { togglePostLike, isPostLiked } from '@/entities/post/api/postsRemote'
import { deletePost } from '@/entities/post/api/postDetailRemote'
import ModerationSheet from '@/entities/report/ui/ModerationSheet'
import { getMyId } from '@/entities/user/model/profile'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import TypeBadge from '@/shared/ui/TypeBadge'

export function formatRelTime(ts: number): string {
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
  /** 목록에서 제거해야 할 때 (삭제·차단) */
  onRemoved?: (postId: string) => void
  onBlocked?: (authorId: string) => void
}

export default function PostCard({ post, onRemoved, onBlocked }: PostCardProps) {
  const [liked, setLiked] = useState(() => isPostLiked(post.id))
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [showMore, setShowMore] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  function handleLike() {
    void requireAuth(() => {
      const next = !liked
      setLiked(next)
      setLikeCount((c) => c + (next ? 1 : -1))
      void togglePostLike(post.id)
    })
  }

  return (
    <article className="bj-post-card">
      <div className="bj-post-card__header">
        <TypeBadge code={post.authorTypeCode} />
        <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
        <span className="bj-post-card__time bj-caption">{formatRelTime(post.ts)}</span>
        <button
          type="button"
          className="bj-icon-btn bj-icon-btn--sm"
          aria-label="더보기"
          onClick={() => setShowMore(true)}
        >
          ⋯
        </button>
      </div>

      <Link href={`/post/${post.id}`} className="bj-unstyled-link">
        <p className="bj-post-card__content bj-body">{post.content}</p>
      </Link>

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
        <Link href={`/post/${post.id}`} className="bj-post-card__comment-count bj-caption bj-unstyled-link">
          댓글 {post.commentCount}
        </Link>
      </div>

      <ModerationSheet
        open={showMore}
        onClose={() => setShowMore(false)}
        targetType="post"
        targetId={post.id}
        authorId={post.authorId}
        isMine={post.authorId === getMyId()}
        onDelete={async () => {
          await deletePost(post.id)
          onRemoved?.(post.id)
        }}
        onBlocked={(id) => {
          onBlocked?.(id)
          onRemoved?.(post.id)
        }}
      />

      <LoginGateSheet open={showGate} onClose={closeGate} next="/home" />
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
