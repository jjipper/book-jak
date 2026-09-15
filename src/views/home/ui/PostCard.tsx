'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/entities/post/model/posts'
import { formatRelTime } from '@/entities/post/model/relTime'
import { togglePostLike, isPostLiked } from '@/entities/post/api/postsRemote'
import Icon from '@/shared/ui/Icon'
import TypeBadge from '@/shared/ui/TypeBadge'

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
      {/* 본문 영역만 링크 — 푸터 버튼은 링크 밖에 둬야 클릭이 겹치지 않는다 */}
      <Link href={`/posts/${post.id}`} className="bj-post-card__link">
        <div className="bj-post-card__header">
          <TypeBadge code={post.authorTypeCode} />
          <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
          <span className="bj-post-card__time bj-caption">{formatRelTime(post.ts)}</span>
        </div>

        <div className="bj-post-card__body">
          <p className="bj-post-card__content bj-body bj-clamp-3">{post.content}</p>
          {post.bookCover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.bookCover}
              alt={post.bookTitle ?? ''}
              className="bj-post-card__cover"
            />
          ) : post.bookTitle ? (
            /* 표지가 없는 책(직접 입력·구간 절판 등)은 제목으로 대신 표시한다 */
            <span className="bj-post-book bj-post-book--aside">
              <span className="bj-post-book__title">{post.bookTitle}</span>
            </span>
          ) : null}
        </div>
      </Link>

      <div className="bj-post-card__footer">
        <button
          type="button"
          onClick={handleLike}
          className={`bj-post-card__like-btn${liked ? ' bj-post-card__like-btn--active' : ''}`}
          aria-label={liked ? '좋아요 취소' : '좋아요'}
        >
          <Icon name={liked ? 'heart-fill' : 'heart'} size={16} />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <Link href={`/posts/${post.id}`} className="bj-post-card__comment-count bj-caption">
          <Icon name="comment" size={16} />
          {post.commentCount}
        </Link>
      </div>
    </article>
  )
}
