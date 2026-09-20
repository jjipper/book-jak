'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { Post } from '@/entities/post/model/posts'
import { loadPost, deletePost } from '@/entities/post/api/postDetailRemote'
import { loadComments, addComment, deleteComment } from '@/entities/comment/api/commentsRemote'
import { COMMENT_MAX, COMMENT_MIN, type PostComment } from '@/entities/comment/model/comments'
import ModerationSheet from '@/entities/report/ui/ModerationSheet'
import { getMyId } from '@/entities/user/model/profile'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import BackLink from '@/shared/ui/BackLink'
import TypeBadge from '@/shared/ui/TypeBadge'
import { toast } from '@/shared/lib/toast'
import { formatRelTime } from '@/views/home/ui/PostCard'

export default function PostDetailView() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<PostComment[]>([])
  const [text, setText] = useState('')
  const [sheet, setSheet] = useState<{ type: 'post' | 'comment'; id: string; authorId: string } | null>(null)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  useEffect(() => {
    async function load() {
      setPost(await loadPost(params.id))
      setComments(await loadComments(params.id))
    }
    void load()
  }, [params.id])

  function handleSubmit() {
    const content = text.trim()
    if (content.length < COMMENT_MIN) return
    requireAuth(async () => {
      try {
        await addComment(params.id, content)
      } catch (e) {
        toast.error(e instanceof Error && e.message.includes('빠르게')
          ? '너무 빠르게 등록했어요. 잠시 후 다시 시도해주세요'
          : '댓글 등록에 실패했어요')
        return
      }
      setText('')
      setComments(await loadComments(params.id))
    })
  }

  if (!post) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-subpage-loading">
            <BackLink href="/home" />
          </div>
        </div>
      </main>
    )
  }

  const myId = getMyId()

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">글</span>
        </header>

        <div className="bj-content--lg">
          <article className="bj-post-card">
            <div className="bj-post-card__header">
              <TypeBadge code={post.authorTypeCode} />
              <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
              <span className="bj-post-card__time bj-caption">{formatRelTime(post.ts)}</span>
              <button
                type="button"
                className="bj-icon-btn bj-icon-btn--sm"
                aria-label="더보기"
                onClick={() => setSheet({ type: 'post', id: post.id, authorId: post.authorId })}
              >
                ⋯
              </button>
            </div>
            <p className="bj-post-card__content bj-body">{post.content}</p>
            {post.bookTitle && (
              <span className="bj-post-card__book-tag bj-caption">{post.bookTitle}</span>
            )}
          </article>

          <p className="bj-caption bj-bold">댓글 {comments.length}개</p>

          <div className="bj-col-10">
            {comments.map((c) => (
              <div key={c.id} className="bj-row bj-row--top">
                <div className="bj-flex-1">
                  <p className="bj-body bj-body--sm">{c.content}</p>
                  <p className="bj-caption">{c.authorNickname} · {formatRelTime(c.ts)}</p>
                </div>
                <button
                  type="button"
                  className="bj-icon-btn bj-icon-btn--sm"
                  aria-label="더보기"
                  onClick={() => setSheet({ type: 'comment', id: c.id, authorId: c.authorId })}
                >
                  ⋯
                </button>
              </div>
            ))}
          </div>

          <div className="bj-col-10">
            <textarea
              className="bj-textarea bj-textarea--sm"
              value={text}
              maxLength={COMMENT_MAX}
              onChange={(e) => setText(e.target.value)}
              placeholder="댓글을 남겨보세요"
            />
            <button
              type="button"
              className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall"
              onClick={handleSubmit}
            >
              댓글 남기기
            </button>
          </div>
        </div>
      </div>

      {sheet && (
        <ModerationSheet
          open
          onClose={() => setSheet(null)}
          targetType={sheet.type}
          targetId={sheet.id}
          authorId={sheet.authorId}
          isMine={sheet.authorId === myId}
          onDelete={async () => {
            if (sheet.type === 'post') {
              await deletePost(sheet.id)
              router.push('/home')
            } else {
              await deleteComment(sheet.id)
              setComments(await loadComments(params.id))
            }
          }}
          onBlocked={async () => {
            if (sheet.type === 'post') router.push('/home')
            else setComments(await loadComments(params.id))
          }}
        />
      )}

      <LoginGateSheet open={showGate} onClose={closeGate} next={`/post/${params.id}`} />
    </main>
  )
}
