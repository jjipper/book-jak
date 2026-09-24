'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { loadClub, displayMemberCount, getJoinedIds, joinClub, leaveClub } from '@/entities/club/model/clubActions'
import { loadClubMembers, loadClubPosts, createClubPost, deleteClubPost } from '@/entities/club/api/clubBoardRemote'
import { formatRelTime } from '@/entities/post/model/relTime'
import { toast } from '@/shared/lib/toast'
import { getMyId } from '@/entities/user/model/profile'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import TypeBadge from '@/shared/ui/TypeBadge'
import type { BookClub, ClubMember, ClubPost } from '@/entities/club/model/clubs'
import BackLink from '@/shared/ui/BackLink'

function formatStartsAt(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][d.getDay()]}) ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function SocialClubDetailView() {
  const params = useParams<{ id: string }>()
  const [club, setClub] = useState<BookClub | null>(null)
  const [joined, setJoined] = useState(false)
  const [members, setMembers] = useState<ClubMember[]>([])
  const [posts, setPosts] = useState<ClubPost[]>([])
  const [draft, setDraft] = useState('')
  const { showGate, closeGate, requireAuth } = useAuthGate()

  // 인원·정원 마감·멤버·게시판을 서버 값으로 다시 맞춘다
  const reload = useCallback(
    () => Promise.all([
      loadClub(params.id),
      getJoinedIds(),
      loadClubMembers(params.id),
      loadClubPosts(params.id),
    ]).then(([c, joinedIds, m, p]) => {
      setClub(c ?? null)
      setJoined(joinedIds.includes(params.id))
      setMembers(m)
      setPosts(p)
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

  async function handlePost() {
    const content = draft.trim()
    if (!content) return
    try {
      await createClubPost(club!.id, content)
      setDraft('')
      setPosts(await loadClubPosts(club!.id))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  async function handleDeletePost(id: string) {
    try {
      await deleteClubPost(id)
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      toast.error((e as Error).message)
    }
  }

  return (
    <main className="bj-shell">
      {club.illust && (
        <div className="bj-club-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/assets/illust/club/${club.illust}.png`}
            alt={club.name}
            className="bj-club-hero__img"
          />
          <div className="bj-club-hero__fade" />
        </div>
      )}

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
          <p className="bj-body bj-text-muted bj-mb-12">{club.description}</p>
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

        {isMine ? (
          <p className="bj-caption bj-text-center">내가 만든 모임이에요</p>
        ) : (
          <button
            type="button"
            onClick={handleToggleJoin}
            disabled={!joined && isFull}
            className={`bj-btn ${joined ? '' : 'bj-btn--primary'} bj-btn--block bj-btn--tall`}
            style={{ opacity: !joined && isFull ? 0.4 : 1 }}
          >
            {joined ? '참여 취소하기' : isFull ? '정원 마감' : '참여하기'}
          </button>
        )}

        <section className="bj-col-8">
          <p className="bj-h2">참여자 {members.length}</p>
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
          <p className="bj-h2">게시판</p>
          {!(joined || isMine) ? (
            <div className="bj-empty bj-card">
              <p className="bj-body bj-text-muted">참여하면 볼 수 있어요</p>
            </div>
          ) : (
            <>
              <textarea
                className="bj-textarea bj-textarea--sm"
                placeholder="모임 사람들에게 한마디"
                maxLength={1000}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button
                type="button"
                className="bj-btn bj-btn--primary bj-btn--block"
                disabled={draft.trim().length === 0}
                onClick={() => void handlePost()}
              >
                글 남기기
              </button>
              {posts.length === 0 && <p className="bj-caption bj-text-muted">첫 글을 남겨보세요</p>}
              {posts.map((p) => (
                <div key={p.id} className="bj-comment">
                  <div className="bj-post-card__header">
                    <Link href={`/people/${p.authorId}`} className="bj-post-card__author-link">
                      <TypeBadge code={p.authorTypeCode} />
                      <span className="bj-post-card__author bj-bold">{p.authorNickname}</span>
                    </Link>
                    <span className="bj-post-card__time bj-caption">{formatRelTime(p.ts)}</span>
                  </div>
                  <p className="bj-body bj-body--sm bj-post-detail__content bj-clamp-3">{p.content}</p>
                  {p.authorId === myId && (
                    <div className="bj-comment__actions">
                      <button type="button" className="bj-section__action" onClick={() => void handleDeletePost(p.id)}>
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </section>
      </div>
      </div>
      <LoginGateSheet open={showGate} onClose={closeGate} next={`/social/clubs/${params.id}`} />
    </main>
  )
}
