'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { loadResult } from '@/entities/reading-type/model/scoring'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { loadPosts, loadPopularPosts } from '@/entities/post/api/postsRemote'
import type { Post } from '@/entities/post/model/posts'
import HomeTopbar from './HomeTopbar'
import HomeHero from './HomeHero'
import PostCard from './PostCard'
import PostCreateSheet from './PostCreateSheet'

function PencilIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export default function HomeView() {
  const [typeCode, setTypeCode] = useState<TypeCode | null>(null)
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)

  // 초기 로드
  useEffect(() => {
    const result = loadResult()
    setTypeCode(result?.typeCode ?? null)

    async function init() {
      const [popular, feed] = await Promise.all([
        loadPopularPosts(3),
        loadPosts({ offset: 0, limit: 20 }),
      ])
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
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </section>
        )}

        {/* 자유 피드 */}
        <section className="bj-section">
          <div className="bj-section__head">
            <p className="bj-h2">모든 글</p>
          </div>
          <div className="bj-col-10">
            {mainFeed.map((p) => (
              <PostCard key={p.id} post={p} />
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
        onClick={() => setShowCreate(true)}
        aria-label="글 쓰기"
      >
        <PencilIcon />
      </button>

      <PostCreateSheet
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handlePostCreated}
      />
    </main>
  )
}
