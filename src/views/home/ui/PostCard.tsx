'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/entities/post/model/posts'
import { formatRelTime } from '@/entities/post/model/relTime'
import { togglePostLike, isPostLiked, markBlocked, deletePost } from '@/entities/post/api/postsRemote'
import ModerationSheet from '@/entities/report/ui/ModerationSheet'
import { getMyId } from '@/entities/user/model/profile'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import Icon from '@/shared/ui/Icon'
import TypeBadge from '@/shared/ui/TypeBadge'

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
        <button
          type="button"
          className="bj-post-card__more-btn"
          aria-label="더보기"
          onClick={() => setShowMore(true)}
        >
          <Icon name="more-horizontal" size={16} />
        </button>
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
          markBlocked(id)
          onBlocked?.(id)
          onRemoved?.(post.id)
        }}
      />

      <LoginGateSheet open={showGate} onClose={closeGate} next="/home" />
    </article>
  )
}
