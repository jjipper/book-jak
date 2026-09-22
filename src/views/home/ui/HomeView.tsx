'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { loadPosts, loadPopularPosts } from '@/entities/post/api/postsRemote'
import type { Post } from '@/entities/post/model/posts'
import HomeTopbar from './HomeTopbar'
import HomeHero from './HomeHero'
import PostCard from './PostCard'
import { useMounted } from '@/shared/lib/useMounted'
import Icon from '@/shared/ui/Icon'
import Link from 'next/link'
import { getFollowingIds } from '@/features/follow/model/follows'
import { getMyId } from '@/entities/user/model/profile'
import PeopleRail from '@/widgets/people-rail/PeopleRail'

type Sort = 'latest' | 'popular'
type Scope = 'all' | 'following'

// 팔로잉 탭을 마지막으로 본 시각 — 사용자별 키. 이보다 새 팔로잉 글이 있으면 빨간 점
const seenKey = () => `bj_following_seen_${getMyId()}`
function getFollowingSeen(): number {
  try { return Number(localStorage.getItem(seenKey())) || 0 } catch { return 0 }
}
function setFollowingSeen(ts: number): void {
  try { localStorage.setItem(seenKey(), String(ts)) } catch { /* 저장 못 해도 점만 다시 뜬다 */ }
}

export default function HomeView() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  // 어떤 정렬·범위로 불러온 목록인지 — 바뀐 직후엔 "글이 없어요"를 띄우지 않는다(로딩 ≠ 빈 상태)
  const [loadedFor, setLoadedFor] = useState<object | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)
  const [sort, setSort] = useState<Sort>('latest')
  const [scope, setScope] = useState<Scope>('all')
  /** 팔로우한 사람 — 0명이면 전체/팔로잉 전환을 숨긴다 */
  const [followingIds, setFollowingIds] = useState<string[]>([])
  const [hasNewFollowing, setHasNewFollowing] = useState(false)

  // 검사 결과는 localStorage라 마운트 후에만 읽는다
  const mounted = useMounted()
  const typeCode: TypeCode | null = useMemo(() => (mounted ? loadResult()?.typeCode ?? null : null), [mounted])

  // 전체 범위일 땐 팔로잉 목록이 늦게 도착해도 목록을 다시 부르지 않게 undefined로 고정
  const authorIds = scope === 'following' ? followingIds : undefined
  const feedParams = useMemo(() => ({ sort, authorIds }), [sort, authorIds])
  const loadedOnce = loadedFor === feedParams

  // 인기글 · 팔로잉 목록은 한 번만
  useEffect(() => {
    void loadPopularPosts(3).then(setPopularPosts)
    void getFollowingIds().then(async (ids) => {
      setFollowingIds(ids)
      if (ids.length === 0) return
      const [latest] = await loadPosts({ authorIds: ids, limit: 1 })
      if (latest && latest.ts > getFollowingSeen()) setHasNewFollowing(true)
    })
  }, [])

  // 정렬·범위가 바뀌면 목록을 처음부터 다시
  useEffect(() => {
    let alive = true
    void loadPosts({ ...feedParams, offset: 0, limit: 20 }).then((feed) => {
      if (!alive) return
      setFeedPosts(feed)
      offsetRef.current = feed.length
      setHasMore(feed.length >= 20)
      setLoadedFor(feedParams)
    })
    return () => { alive = false }
  }, [feedParams])

  function openFollowing() {
    setScope('following')
    setHasNewFollowing(false)
    setFollowingSeen(Date.now())
  }

  /** 삭제·차단으로 목록에서 빼기 */
  const removePost = useCallback((postId: string) => {
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId))
    setPopularPosts((prev) => prev.filter((p) => p.id !== postId))
  }, [])

  const removeAuthor = useCallback((authorId: string) => {
    setFeedPosts((prev) => prev.filter((p) => p.authorId !== authorId))
    setPopularPosts((prev) => prev.filter((p) => p.authorId !== authorId))
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore || !loadedOnce) return
    loadingRef.current = true
    setLoading(true)
    try {
      const more = await loadPosts({ ...feedParams, offset: offsetRef.current, limit: 20 })
      if (more.length === 0) {
        setHasMore(false)
      } else {
        setFeedPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id))
          const next = more.filter((p) => !existingIds.has(p.id))
          offsetRef.current += next.length
          return [...prev, ...next]
        })
        if (more.length < 20) setHasMore(false)
      }
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [hasMore, loadedOnce, feedParams])

  // 무한스크롤 sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0]?.isIntersecting) void loadMore() },
      { rootMargin: '200px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [loadMore])

  // 인기글과 피드에서 중복 제거 (인기글은 피드에서 빼지 않고 그냥 보여줌)
  const popularIds = new Set(popularPosts.map((p) => p.id))
  const mainFeed = feedPosts.filter((p) => !popularIds.has(p.id))

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <HomeTopbar />
        <HomeHero typeCode={typeCode} />

        {/* 인기글 */}
        {popularPosts.length > 0 && (
          <section className="bj-section">
            <div className="bj-section__head">
              <p className="bj-h2">인기글</p>
            </div>
            <div className="bj-col-10">
              {popularPosts.map((p) => (
                <PostCard key={p.id} post={p} onRemoved={removePost} onBlocked={removeAuthor} />
              ))}
            </div>
          </section>
        )}

        {mounted && <PeopleRail typeCode={typeCode} />}

        {/* 자유 피드 */}
        <section className="bj-section">
          <div className="bj-section__head">
            <p className="bj-h2">{scope === 'following' ? '팔로잉' : '모든 글'}</p>
            <Link href="/posts/new" className="bj-section__action">
              + 만들기
            </Link>
          </div>
          <div className="bj-row-between bj-feed-filter">
            {followingIds.length > 0 ? (
              <div className="bj-feed-filter__group">
                <button
                  type="button"
                  className={`bj-chip${scope === 'all' ? ' bj-chip--active' : ''}`}
                  aria-pressed={scope === 'all'}
                  onClick={() => setScope('all')}
                >
                  전체
                </button>
                <button
                  type="button"
                  className={`bj-chip${scope === 'following' ? ' bj-chip--active' : ''}`}
                  aria-pressed={scope === 'following'}
                  onClick={openFollowing}
                >
                  팔로잉
                  {hasNewFollowing && <span className="bj-feed-filter__dot" aria-label="새 글" />}
                </button>
              </div>
            ) : <span />}
            <div className="bj-feed-filter__group">
              {(['latest', 'popular'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`bj-chip${sort === s ? ' bj-chip--active' : ''}`}
                  aria-pressed={sort === s}
                  onClick={() => setSort(s)}
                >
                  {s === 'latest' ? '최신순' : '인기순'}
                </button>
              ))}
            </div>
          </div>
          <div className="bj-col-10">
            {mainFeed.map((p) => (
              <PostCard key={p.id} post={p} onRemoved={removePost} onBlocked={removeAuthor} />
            ))}
            {loadedOnce && mainFeed.length === 0 && scope === 'following' && (
              <p className="bj-caption bj-text-muted">팔로우한 사람의 새 글이 아직 없어요</p>
            )}
            {loadedOnce && mainFeed.length === 0 && scope === 'all' && (
              <div className="bj-card bj-text-center">
                <p className="bj-h2 bj-mb-10">아직 올라온 글이 없어요</p>
                <p className="bj-body bj-text-muted bj-mb-20">
                  첫 글을 남기면 취향이 비슷한 사람들이 찾아와요
                </p>
                <Link href="/posts/new" className="bj-btn bj-btn--primary">
                  첫 글 쓰기
                </Link>
              </div>
            )}
          </div>
          {loading && (
            <p className="bj-caption bj-text-muted bj-search-loading">글 불러오는 중…</p>
          )}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
      </div>

      {/* 글쓰기 FAB */}
      <Link href="/posts/new" className="bj-fab" aria-label="글 쓰기">
        <Icon name="edit" size={22} />
      </Link>
    </main>
  )
}
