'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { loadPost, deletePost, isMyPost, togglePostLike, isPostLiked, markBlocked } from '@/entities/post/api/postsRemote'
import { loadComments, createComment, updateComment, deleteComment, getMyAuthorIds } from '@/entities/post/api/commentsRemote'
import type { Post } from '@/entities/post/model/posts'
import type { PostComment } from '@/entities/post/model/comments'
import { formatRelTime } from '@/entities/post/model/relTime'
import { bookDetailHref } from '@/entities/external-book/model/aladdinBooks'
import ModerationSheet from '@/entities/report/ui/ModerationSheet'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'
import Icon from '@/shared/ui/Icon'
import TypeBadge from '@/shared/ui/TypeBadge'
import ConfirmSheet from '@/shared/ui/ConfirmSheet'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'

export default function PostDetailView() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [post, setPost] = useState<Post | null | false>(null)
  const [mine, setMine] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [comments, setComments] = useState<PostComment[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [myIds, setMyIds] = useState<Set<string>>(new Set())
  const [draft, setDraft] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState('')
  const [confirm, setConfirm] = useState<{ kind: 'post' } | { kind: 'comment'; id: string } | null>(null)
  /** 남의 글·댓글에 대한 신고·차단 시트 */
  const [moderate, setModerate] = useState<
    { targetType: 'post' | 'comment'; targetId: string; authorId: string } | null
  >(null)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  // 글 본문과 댓글은 서로 기다리지 않는다 — 한쪽이 느려도 다른 쪽은 그려져야 한다
  useEffect(() => {
    async function load() {
      const found = await loadPost(id)
      if (!found) { setPost(false); return }
      setPost(found)
      setLikeCount(found.likeCount)
      setLiked(isPostLiked(found.id))
      setMine(await isMyPost(found))
    }
    void load()
  }, [id])

  useEffect(() => {
    async function load() {
      setComments(await loadComments(id))
      setCommentsLoaded(true)
      setMyIds(await getMyAuthorIds())
    }
    void load()
  }, [id])

  function handleLike() {
    if (!post) return
    void requireAuth(() => {
      const next = !liked
      setLiked(next)
      setLikeCount((c) => c + (next ? 1 : -1))
      void togglePostLike(post.id)
    })
  }

  function handleAddComment(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    requireAuth(async () => {
      const created = await createComment(id, text)
      setComments((prev) => [...prev, created])
      setDraft('')
    })
  }

  async function handleSaveEdit(commentId: string) {
    const text = editDraft.trim()
    if (!text) return
    const updated = await updateComment(commentId, text)
    if (!updated) { toast.error('댓글을 수정하지 못했어요'); return }
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)))
    setEditingId(null)
  }

  async function handleConfirmDelete() {
    if (!confirm) return
    if (confirm.kind === 'post') {
      if (!(await deletePost(id))) { toast.error('글을 삭제하지 못했어요'); setConfirm(null); return }
      router.replace('/home')
      return
    }
    if (!(await deleteComment(confirm.id))) { toast.error('댓글을 삭제하지 못했어요'); setConfirm(null); return }
    setComments((prev) => prev.filter((c) => c.id !== confirm.id))
    setConfirm(null)
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">글</span>
          {post && (
            <span className="bj-post-detail__actions">
              {mine ? (
                <>
                  <Link href={`/posts/${id}/edit`} className="bj-section__action">수정</Link>
                  <button type="button" className="bj-section__action" onClick={() => setConfirm({ kind: 'post' })}>
                    삭제
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="bj-section__action"
                  onClick={() => setModerate({ targetType: 'post', targetId: post.id, authorId: post.authorId })}
                >
                  신고
                </button>
              )}
            </span>
          )}
        </header>

        <div className="bj-content--lg">
          {post === null && <p className="bj-caption bj-text-muted">불러오는 중…</p>}
          {post === false && <p className="bj-body bj-text-muted">글을 찾을 수 없어요</p>}

          {post && (
            <>
              <article className="bj-card bj-col-12">
                <div className="bj-post-card__header">
                  <TypeBadge code={post.authorTypeCode} />
                  <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
                  <span className="bj-post-card__time bj-caption">
                    {formatRelTime(post.ts)}{post.editedTs ? ' · 수정됨' : ''}
                  </span>
                </div>

                <p className="bj-body bj-post-detail__content">{post.content}</p>

                {post.bookTitle && (
                  post.bookIsbn ? (
                    <Link href={bookDetailHref(post.bookIsbn)} className="bj-post-book">
                      {post.bookCover && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.bookCover} alt="" className="bj-post-book__cover" />
                      )}
                      <span className="bj-post-book__title">{post.bookTitle}</span>
                      <Icon name="chevron-right" size={16} />
                    </Link>
                  ) : (
                    <div className="bj-post-book">
                      <span className="bj-post-book__title">{post.bookTitle}</span>
                    </div>
                  )
                )}

                <div className="bj-post-card__footer">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`bj-post-card__like-btn${liked ? ' bj-post-card__like-btn--active' : ''}`}
                  >
                    <Icon name={liked ? 'heart-fill' : 'heart'} size={16} />
                    {likeCount > 0 && <span>{likeCount}</span>}
                  </button>
                  <span className="bj-post-card__comment-count bj-caption">
                    <Icon name="comment" size={16} />
                    {comments.length}
                  </span>
                </div>
              </article>

              <section>
                <p className="bj-section-tag bj-mb-8">댓글 {comments.length}</p>

                <div className="bj-col-8">
                  {comments.map((c) => (
                    <div key={c.id} className="bj-comment">
                      <div className="bj-post-card__header">
                        <TypeBadge code={c.authorTypeCode} />
                        <span className="bj-post-card__author bj-bold">{c.authorNickname}</span>
                        <span className="bj-post-card__time bj-caption">
                          {formatRelTime(c.ts)}{c.editedTs ? ' · 수정됨' : ''}
                        </span>
                      </div>

                      {editingId === c.id ? (
                        <div className="bj-col-8">
                          <textarea
                            className="bj-textarea"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            rows={3}
                            maxLength={300}
                          />
                          <div className="bj-comment__actions">
                            <button type="button" className="bj-section__action" onClick={() => setEditingId(null)}>
                              취소
                            </button>
                            <button type="button" className="bj-section__action" onClick={() => void handleSaveEdit(c.id)}>
                              저장
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="bj-body bj-body--sm bj-post-detail__content">{c.content}</p>
                          <div className="bj-comment__actions">
                            {myIds.has(c.authorId) ? (
                              <>
                                <button
                                  type="button"
                                  className="bj-section__action"
                                  onClick={() => { setEditingId(c.id); setEditDraft(c.content) }}
                                >
                                  수정
                                </button>
                                <button
                                  type="button"
                                  className="bj-section__action"
                                  onClick={() => setConfirm({ kind: 'comment', id: c.id })}
                                >
                                  삭제
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="bj-section__action"
                                onClick={() => setModerate({ targetType: 'comment', targetId: c.id, authorId: c.authorId })}
                              >
                                신고
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="bj-caption bj-text-muted">
                      {commentsLoaded ? '첫 댓글을 남겨보세요' : '댓글 불러오는 중…'}
                    </p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="bj-col-8 bj-mt-14">
                  <textarea
                    className="bj-textarea"
                    placeholder="댓글 남기기"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={3}
                    maxLength={300}
                  />
                  <button type="submit" className="bj-btn bj-btn--primary bj-btn--block" disabled={!draft.trim()}>
                    댓글 등록
                  </button>
                </form>
              </section>
            </>
          )}
        </div>
      </div>

      <ConfirmSheet
        open={confirm !== null}
        message={confirm?.kind === 'post' ? '이 글을 삭제할까요?' : '이 댓글을 삭제할까요?'}
        confirmLabel="삭제"
        cancelLabel="취소"
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setConfirm(null)}
      />
      {moderate && (
        <ModerationSheet
          open
          onClose={() => setModerate(null)}
          targetType={moderate.targetType}
          targetId={moderate.targetId}
          authorId={moderate.authorId}
          onBlocked={(userId) => {
            markBlocked(userId)
            // 글 작성자를 차단하면 이 화면에 머물 이유가 없다
            if (moderate.targetType === 'post') router.push('/home')
            else setComments((prev) => prev.filter((c) => c.authorId !== userId))
            setModerate(null)
          }}
        />
      )}

      <LoginGateSheet open={showGate} onClose={closeGate} next={`/posts/${id}`} />
    </main>
  )
}
