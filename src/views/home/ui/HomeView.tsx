'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { loadPosts, loadPopularPosts } from '@/entities/post/api/postsRemote'
import type { Post } from '@/entities/post/model/posts'
import { getBlockedIds } from '@/entities/report/api/moderationRemote'
import HomeTopbar from './HomeTopbar'
import HomeHero from './HomeHero'
import PostCard from './PostCard'
import PostCreateSheet from './PostCreateSheet'
import { useMounted } from '@/shared/lib/useMounted'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import Icon from '@/shared/ui/Icon'

export default function HomeView() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [blocked, setBlocked] = useState<string[]>([])
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)

  // 검사 결과는 localStorage라 마운트 후에만 읽는다
  const mounted = useMounted()
  const typeCode: TypeCode | null = useMemo(() => (mounted ? loadResult()?.typeCode ?? null : null), [mounted])

  // 초기 로드
  useEffect(() => {
    async function init() {
      const [popular, feed, blockedIds] = await Promise.all([
        loadPopularPosts(3),
        loadPosts({ offset: 0, limit: 20 }),
        getBlockedIds(),
      ])
      setBlocked(blockedIds)
      setPopularPosts(popular)
      setFeedPosts(feed)
      offsetRef.current = feed.length
      setHasMore(feed.length >= 20)
    }
    void init()
  }, [])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    setLoading(true)
    try {
      const more = await loadPosts({ offset: offsetRef.current, limit: 20 })
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
  }, [hasMore])

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

  function handlePostCreated(post: Post) {
    setFeedPosts((prev) => [post, ...prev])
    offsetRef.current += 1
  }

  function handleRemoved(postId: string) {
    setFeedPosts((prev) => prev.filter((p) => p.id !== postId))
    setPopularPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  // 인기글과 피드에서 중복 제거 (인기글은 피드에서 빼지 않고 그냥 보여줌)
  // ponytail: 차단 필터는 클라이언트에서. 쿼리 레벨로 옮기려면 postsRemote.loadPosts 수정 필요.
  const blockedSet = new Set(blocked)
  const visiblePopular = popularPosts.filter((p) => !blockedSet.has(p.authorId))
  const popularIds = new Set(visiblePopular.map((p) => p.id))
  const mainFeed = feedPosts.filter((p) => !popularIds.has(p.id) && !blockedSet.has(p.authorId))

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <HomeTopbar />
        <HomeHero typeCode={typeCode} />

        {/* 인기글 */}
        {visiblePopular.length > 0 && (
          <section className="bj-section">
            <div className="bj-section__head">
              <p className="bj-h2">인기글</p>
            </div>
            <div className="bj-col-10">
              {visiblePopular.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  onRemoved={handleRemoved}
                  onBlocked={(id) => setBlocked((prev) => [...prev, id])}
                />
              ))}
            </div>
          </section>
        )}

        {/* 자유 피드 */}
        <section className="bj-section">
          <div className="bj-section__head">
            <p className="bj-h2">모든 글</p>
            <button
              type="button"
              className="bj-section__action"
              onClick={() => setShowCreate(true)}
            >
              + 만들기
            </button>
          </div>
          <div className="bj-col-10">
            {mainFeed.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onRemoved={handleRemoved}
                onBlocked={(id) => setBlocked((prev) => [...prev, id])}
              />
            ))}
          </div>
          {loading && (
            <p className="bj-caption bj-text-muted bj-search-loading">글 불러오는 중…</p>
          )}
          <div ref={sentinelRef} style={{ height: 1 }} />
        </section>
      </div>

      {/* 글쓰기 FAB */}
      <button
        type="button"
        className="bj-fab"
        onClick={() => void requireAuth(() => setShowCreate(true))}
        aria-label="글 쓰기"
      >
        <Icon name="edit" size={22} />
      </button>

      <PostCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handlePostCreated}
      />

      <LoginGateSheet open={showGate} onClose={closeGate} next="/home" />
    </main>
  )
}
