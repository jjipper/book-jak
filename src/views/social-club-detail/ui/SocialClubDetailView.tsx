'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadClub, displayMemberCount, getJoinedIds, getInterestedIds, joinClub, leaveClub } from '@/entities/club/model/clubActions'
import { loadClubMembers, loadClubQna, createClubPost, deleteClubPost, type ClubQna } from '@/entities/club/api/clubBoardRemote'
import { formatRelTime } from '@/entities/post/model/relTime'
import { toast } from '@/shared/lib/toast'
import { getMyId } from '@/entities/user/model/profile'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import TypeBadge from '@/shared/ui/TypeBadge'
import ClubInterestButton from '@/entities/club/ui/ClubInterestButton'
import { clubIllust, type BookClub, type ClubMember, type ClubPost } from '@/entities/club/model/clubs'
import BackLink from '@/shared/ui/BackLink'
import './SocialClubDetailView.css'

function formatStartsAt(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function QnaPost({ post, organizerId, myId, onDelete }: {
  post: ClubPost
  organizerId: string | null
  myId: string
  onDelete: () => void
}) {
  const byOrganizer = post.authorId === organizerId
  return (
    <div className={`bj-comment${byOrganizer ? ' bj-qna--organizer' : ''}`}>
      <div className="bj-post-card__header">
        <Link href={`/people/${post.authorId}`} className="bj-post-card__author-link">
          <TypeBadge code={post.authorTypeCode} />
          <span className="bj-post-card__author bj-bold">{post.authorNickname}</span>
        </Link>
        {byOrganizer && <span className="bj-chip bj-chip--active">주최자</span>}
        <span className="bj-post-card__time bj-caption">{formatRelTime(post.ts)}</span>
      </div>
      <p className="bj-body bj-body--sm bj-post-detail__content">{post.content}</p>
      {post.authorId === myId && (
        <div className="bj-comment__actions">
          <button type="button" className="bj-section__action" onClick={onDelete}>삭제</button>
        </div>
      )}
    </div>
  )
}

export default function SocialClubDetailView() {
  const params = useParams<{ id: string }>()
  const [club, setClub] = useState<BookClub | null>(null)
  const [joined, setJoined] = useState(false)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [threads, setThreads] = useState<ClubQna[]>([])
  const [draft, setDraft] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyDraft, setReplyDraft] = useState('')
  const [interested, setInterested] = useState(false)
  const [descOpen, setDescOpen] = useState(false)
  const { showGate, closeGate, requireAuth } = useAuthGate()

  // 인원·정원 마감·멤버·QnA를 서버 값으로 다시 맞춘다
  const reload = useCallback(
    () => Promise.all([
      loadClub(params.id),
      getJoinedIds(),
      loadClubMembers(params.id),
      loadClubQna(params.id),
      getInterestedIds(),
    ]).then(([c, joinedIds, m, p, interestedIds]) => {
      setClub(c ?? null)
      setJoined(joinedIds.includes(params.id))
      setMembers(m)
      setThreads(p)
      setInterested(interestedIds.includes(params.id))
    }),
    [params.id],
  )

  useEffect(() => { void reload() }, [reload])

  if (!club) {
    return (
      <main className="bj-shell">
        <div className="bj-frame">
          <div className="bj-subpage-loading">
            <BackLink href="/social" />
          </div>
        </div>
      </main>
    )
  }

  const myId = getMyId()
  const organizerName = club.organizerId
    ? members.find((m) => m.id === club.organizerId)?.nickname ?? '알 수 없음'
    : '북작'
  const memberCount = displayMemberCount(club)
  const isFull = memberCount >= club.capacity
  const isMine = club.organizerId === myId

  function handleToggleJoin() {
    requireAuth(() => {
      void (async () => {
        try {
          if (joined) {
            await leaveClub(club!.id)
            setJoined(false)
          } else {
            await joinClub(club!.id)
            setJoined(true)
          }
        } catch (e) {
          toast.error((e as Error).message)
        }
        await reload()
      })()
    })
  }

  // parentId가 있으면 답글. 없으면 새 질문.
  function handlePost(content: string, parentId?: string) {
    if (!content) return
    void requireAuth(() => {
      void (async () => {
        try {
          await createClubPost(club!.id, content, parentId)
          if (parentId) {
            setReplyTo(null)
            setReplyDraft('')
          } else {
            setDraft('')
          }
          setThreads(await loadClubQna(club!.id))
        } catch (e) {
          toast.error((e as Error).message)
        }
      })()
    })
  }

  async function handleDeletePost(post: ClubPost, replyCount: number) {
    const warn = replyCount > 0
      ? `이 질문을 지우면 달린 답글 ${replyCount}개도 함께 사라져요. 삭제할까요?`
      : '삭제할까요?'
    if (!window.confirm(warn)) return
    try {
      await deleteClubPost(post.id)
      setThreads(await loadClubQna(club!.id))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <main className="bj-shell">
      <div className="bj-club-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/assets/illust/club/${clubIllust(club)}.webp`}
          alt={club.name}
          className="bj-club-hero__img"
        />
        <div className="bj-club-hero__fade" />
      </div>

      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/social" />
        <span className="bj-h2">모임 상세</span>
      </header>

      <div className="bj-content--lg">
        <div className="bj-card">
          <div className="bj-meta-row bj-mb-8">
            {club.isOfficial && <span className="bj-chip bj-chip--active">공식</span>}
            <p className="bj-h1">{club.name}</p>
            <span className="bj-chip">{club.format}</span>
          </div>
          {(club.startsAt || club.region) && (
            <p className="bj-caption bj-mb-8">
              {[club.startsAt && formatStartsAt(club.startsAt), club.region].filter(Boolean).join(' · ')}
            </p>
          )}
          <div className="bj-mb-12">
            <p className={`bj-body bj-text-muted bj-post-detail__content${descOpen || club.description.length <= 160 ? '' : ' bj-clamp-3'}`}>
              {club.description}
            </p>
            {club.description.length > 160 && (
              <button type="button" className="bj-section__action" onClick={() => setDescOpen((v) => !v)}>
                {descOpen ? '접기' : '더 보기'}
              </button>
            )}
          </div>
          <div className="bj-tag-group bj-mb-16">
            {club.tags.map((tag) => <span key={tag} className="bj-chip bj-chip--active">{tag}</span>)}
          </div>
          <div className="bj-row">
            <div className="bj-flex-1">
              <p className="bj-caption">주최자</p>
              <p className="bj-body bj-discuss-text bj-semibold">{organizerName}</p>
            </div>
            <div className="bj-text-right">
              <p className="bj-caption">인원</p>
              <p className="bj-body bj-discuss-text bj-semibold">{memberCount}/{club.capacity}</p>
            </div>
          </div>
        </div>

        <div className="bj-club-actions">
          {isMine ? (
            <Link href={`/social/clubs/${club.id}/edit`} className="bj-btn bj-btn--tall bj-flex-1 bj-text-center">
              모임 수정
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleToggleJoin}
              disabled={!joined && isFull}
              className={`bj-btn ${joined ? '' : 'bj-btn--primary'} bj-btn--tall bj-flex-1`}
              style={{ opacity: !joined && isFull ? 0.4 : 1 }}
            >
              {joined ? '참여 취소' : isFull ? '정원 마감' : '참여하기'}
            </button>
          )}
          <ClubInterestButton clubId={club.id} interested={interested} onChange={setInterested} />
        </div>

        <section className="bj-col-8">
          <p className="bj-h2">참여자 {memberCount}/{club.capacity}</p>
          {members.map((m) => (
            <Link key={m.id} href={`/people/${m.id}`} className="bj-row bj-people-link">
              <div className="bj-avatar-circle bj-flex-none" style={{ width: 44, height: 44 }}>
                {m.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.avatarUrl} alt="" className="bj-avatar-img" />
                )}
              </div>
              <p className="bj-body bj-bold bj-body--sm bj-flex-1">{m.nickname}</p>
              {m.id === club.organizerId && <span className="bj-chip bj-chip--active">주최자</span>}
            </Link>
          ))}
        </section>

        <section className="bj-col-8">
          <p className="bj-h2">궁금한 점</p>
          <p className="bj-caption bj-text-muted">주최자와 참여자가 답해줘요</p>
          <textarea
            className="bj-textarea bj-textarea--sm"
            placeholder="궁금한 점을 남겨보세요"
            maxLength={1000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <button
            type="button"
            className="bj-btn bj-btn--primary bj-btn--block"
            disabled={draft.trim().length === 0}
            onClick={() => handlePost(draft.trim())}
          >
            질문 남기기
          </button>
          {threads.length === 0 && <p className="bj-caption bj-text-muted">아직 질문이 없어요</p>}
          {threads.map(({ question, replies }) => (
            <div key={question.id} className="bj-qna">
              <QnaPost
                post={question}
                organizerId={club!.organizerId}
                myId={myId}
                onDelete={() => void handleDeletePost(question, replies.length)}
              />
              {replies.length > 0 && (
                <div className="bj-qna__replies">
                  {replies.map((r) => (
                    <QnaPost
                      key={r.id}
                      post={r}
                      organizerId={club!.organizerId}
                      myId={myId}
                      onDelete={() => void handleDeletePost(r, 0)}
                    />
                  ))}
                </div>
              )}
              <div className="bj-qna__replies">
                {replyTo === question.id ? (
                  <>
                    <textarea
                      className="bj-textarea bj-textarea--sm"
                      placeholder="답글을 남겨보세요"
                      maxLength={1000}
                      autoFocus
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                    />
                    <div className="bj-comment__actions">
                      <button
                        type="button"
                        className="bj-section__action"
                        disabled={replyDraft.trim().length === 0}
                        onClick={() => handlePost(replyDraft.trim(), question.id)}
                      >
                        답글 남기기
                      </button>
                      <button type="button" className="bj-section__action" onClick={() => setReplyTo(null)}>
                        취소
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    type="button"
                    className="bj-section__action bj-qna__reply-open"
                    onClick={() => { setReplyTo(question.id); setReplyDraft('') }}
                  >
                    답글 달기
                  </button>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/clubs/${params.id}`} />
    </main>
  )
}
