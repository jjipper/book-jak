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

export default function HomeView() {
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [feedPosts, setFeedPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const offsetRef = useRef(0)

  // 검사 결과는 localStorage라 마운트 후에만 읽는다
  const mounted = useMounted()
  const typeCode: TypeCode | null = useMemo(() => (mounted ? loadResult()?.typeCode ?? null : null), [mounted])

  // 초기 로드
  useEffect(() => {
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
            <Link href="/posts/new" className="bj-section__action">
              + 만들기
            </Link>
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
      <Link href="/posts/new" className="bj-fab" aria-label="글 쓰기">
        <Icon name="edit" size={22} />
      </Link>
    </main>
  )
}
