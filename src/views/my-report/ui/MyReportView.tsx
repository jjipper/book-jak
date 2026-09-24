'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { evaluateBadges, BADGE_TIER_LABEL, type BadgeStats } from '@/entities/reading-type/model/badges'
import {
  buildDiscovery, buildGenres, buildKeywords, buildSpectrum, buildStarProfile, typeRarityPct,
  type AxisSpectrum, type GenreSlice,
} from '@/entities/profile-report/model/report'
import {
  loadFavoriteBooks, loadReportSignals, replaceFavoriteBooks, type FavoriteBook,
} from '@/entities/profile-report/api/reportRemote'
import { loadBookRatings, type BookRatingRecord } from '@/entities/book-rating/model/bookRatings'
import { getReactionCounts } from '@/entities/blind-book/model/blindReactions'
import { loadWishlist } from '@/features/wishlist/model/wishlist'
import { getFollowerIds, getFollowingIds } from '@/features/follow/model/follows'
import { loadMyPosts } from '@/entities/post/api/myPostsRemote'
import { loadMyComments } from '@/entities/post/api/commentsRemote'
import { loadClubs, getJoinedIds } from '@/entities/club/model/clubActions'
import { getMyId } from '@/entities/user/model/profile'
import { fetchProfile } from '@/entities/user/api/profileRemote'
import BackLink from '@/shared/ui/BackLink'
import Icon from '@/shared/ui/Icon'
import Input from '@/shared/ui/Input'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import TypeBadge from '@/shared/ui/TypeBadge'
import RarityBadge from '@/shared/ui/RarityBadge'
import BadgeMedal from './BadgeMedal'
import { toast } from '@/shared/lib/toast'
import './MyReportView.css'

/* ──────────────────────────────────────────────────────────────
   차트 조각들 — SVG 직접. 카드마다 형태를 달리해 스크롤을 지루하지 않게.
   ────────────────────────────────────────────────────────────── */

/** 장르 조각별 주황 농도 — 강조색은 하나라는 규칙을 지키면서 구분은 만든다 */
function genreTint(i: number, total: number): string {
  const mix = total <= 1 ? 100 : Math.round(100 - (i / (total - 1)) * 62)
  return `color-mix(in srgb, var(--color-accent) ${mix}%, var(--color-track))`
}

const DONUT_R = 54
const DONUT_C = 2 * Math.PI * DONUT_R

function GenreDonut({ slices }: { slices: GenreSlice[] }) {
  // 조각 시작 지점은 앞 조각들의 길이 합
  const arcs = slices.reduce<{ name: string; len: number; offset: number }[]>((acc, s) => {
    const prev = acc[acc.length - 1]
    const offset = prev ? prev.offset + prev.len : 0
    acc.push({ name: s.name, len: (s.pct / 100) * DONUT_C, offset })
    return acc
  }, [])

  return (
    <svg viewBox="0 0 140 140" className="bj-donut" role="img"
      aria-label={slices.map((s) => `${s.name} ${s.pct}%`).join(', ')}>
      <circle cx="70" cy="70" r={DONUT_R} className="bj-donut__track" />
      {arcs.map((a, i) => (
        <circle
          key={a.name}
          cx="70" cy="70" r={DONUT_R}
          className="bj-donut__arc"
          style={{ stroke: genreTint(i, arcs.length) }}
          strokeDasharray={`${a.len} ${DONUT_C - a.len}`}
          strokeDashoffset={-a.offset}
        />
      ))}
      <text x="70" y="64" className="bj-donut__center-num">{slices[0]?.pct ?? 0}%</text>
      <text x="70" y="82" className="bj-donut__center-label">{slices[0]?.name ?? ''}</text>
    </svg>
  )
}

function StarColumns({ distribution }: { distribution: readonly number[] }) {
  const max = Math.max(1, ...distribution)
  return (
    <div className="bj-starcols" role="img"
      aria-label={distribution.map((n, i) => `${i + 1}점 ${n}권`).join(', ')}>
      {distribution.map((n, i) => (
        <div key={i} className="bj-starcols__col">
          <span className="bj-starcols__num">{n}</span>
          <div className="bj-starcols__track">
            <div className="bj-starcols__fill" style={{ height: `${(n / max) * 100}%` }} />
          </div>
          <span className="bj-starcols__label">★{i + 1}</span>
        </div>
      ))}
    </div>
  )
}

/** 반원 게이지 — 담기 비율 */
function DiscoveryGauge({ pct }: { pct: number }) {
  const r = 58
  const len = Math.PI * r
  return (
    <svg viewBox="0 0 140 82" className="bj-gauge" role="img" aria-label={`담기 비율 ${pct}%`}>
      <path d={`M 12 70 A ${r} ${r} 0 0 1 128 70`} className="bj-gauge__track" />
      <path
        d={`M 12 70 A ${r} ${r} 0 0 1 128 70`}
        className="bj-gauge__fill"
        strokeDasharray={`${(pct / 100) * len} ${len}`}
      />
      <text x="70" y="62" className="bj-gauge__num">{pct}%</text>
      <text x="14" y="80" className="bj-gauge__end">신중</text>
      <text x="126" y="80" textAnchor="end" className="bj-gauge__end">모험</text>
    </svg>
  )
}

function SpectrumRow({ axis }: { axis: AxisSpectrum }) {
  const leftWins = axis.picked === axis.left
  return (
    <div className="bj-spectrum">
      <div className="bj-spectrum__ends">
        <span className={`bj-spectrum__end${leftWins ? ' bj-spectrum__end--on' : ''}`}>
          {axis.left} · {axis.leftLabel}
        </span>
        <span className={`bj-spectrum__end${leftWins ? '' : ' bj-spectrum__end--on'}`}>
          {axis.rightLabel} · {axis.right}
        </span>
      </div>
      <div className="bj-spectrum__track">
        <div
          className={`bj-spectrum__fill bj-spectrum__fill--${leftWins ? 'left' : 'right'}`}
          style={leftWins
            ? { left: 0, width: `${axis.leftPct}%` }
            : { right: 0, width: `${100 - axis.leftPct}%` }}
        />
        <span className="bj-spectrum__tick" style={{ left: `${axis.leftPct}%` }} />
      </div>
    </div>
  )
}

function SectionCard({ tag, title, children }: {
  tag: string
  title?: string
  children: React.ReactNode
}) {
  return (
    <section className="bj-card bj-report-card">
      <div className="bj-card-section-head">
        <span className="bj-section-tag">{tag}</span>
      </div>
      {title && <p className="bj-h2 bj-report-card__title">{title}</p>}
      {children}
    </section>
  )
}

/* ────────────────────────────────────────────────────────────── */

export default function MyReportView() {
  const [ready, setReady] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)
  const [ratings, setRatings] = useState<BookRatingRecord[]>([])
  const [reaction, setReaction] = useState({ saved: 0, passed: 0 })
  const [favorites, setFavorites] = useState<FavoriteBook[]>([])
  const [picking, setPicking] = useState(false)
  const [query, setQuery] = useState('')
  const [stats, setStats] = useState<BadgeStats | null>(null)

  const result = useMemo(() => (ready ? loadResult() : null), [ready])
  const myType = result ? READING_TYPES[result.typeCode] : null

  const { slices, total: genreTotal } = useMemo(() => buildGenres(ratings), [ratings])
  const starProfile = useMemo(() => buildStarProfile(ratings), [ratings])
  const discovery = useMemo(() => buildDiscovery(reaction.saved, reaction.passed), [reaction])
  const keywords = useMemo(
    () => buildKeywords(result?.typeCode ?? null, slices),
    [result, slices],
  )
  const badges = useMemo(() => (stats ? evaluateBadges(stats) : []), [stats])
  const unlockedCount = badges.filter((b) => b.unlocked).length

  useEffect(() => {
    async function load() {
      setReady(true)
      const saved = loadResult()
      const myRatings = loadBookRatings()
      setRatings(myRatings)

      let profile: Awaited<ReturnType<typeof fetchProfile>> = null
      try {
        profile = await fetchProfile()
      } catch {
        toast.error('프로필 로드에 실패했어요')
      }
      if (!profile) return
      setLoggedIn(true)

      const [counts, signals, favs, followerIds, followingIds, posts, comments, joinedIds, clubs] =
        await Promise.all([
          getReactionCounts(),
          loadReportSignals(),
          loadFavoriteBooks(),
          getFollowerIds(),
          getFollowingIds(),
          loadMyPosts(),
          loadMyComments(),
          getJoinedIds(),
          loadClubs(),
        ])
      setReaction(counts)
      setFavorites(favs)

      const myId = getMyId()
      const genres = buildGenres(myRatings)
      const topShare = genres.total
        ? Math.max(0, ...genres.slices.filter((s) => s.name !== '기타').map((s) => s.count)) / genres.total
        : 0

      setStats({
        answerBadges: saved?.badgeCandidates ?? [],
        hasTestResult: !!saved,
        typeRarityPct: typeRarityPct(saved?.typeCode ?? null),
        ratedCount: myRatings.length,
        reviewCount: myRatings.filter((r) => r.review?.trim()).length,
        avgStars: myRatings.length
          ? myRatings.reduce((sum, r) => sum + r.stars, 0) / myRatings.length
          : 0,
        genreCount: new Set(myRatings.map((r) => r.categoryName).filter(Boolean)).size,
        topGenreShare: topShare,
        blindRevealed: signals.blindRevealed,
        blindSaved: counts.saved,
        blindPassed: counts.passed,
        wishCount: loadWishlist().length,
        recCount: signals.recCount,
        postCount: posts.length,
        commentCount: comments.length,
        clubCount: clubs.filter((c) => c.organizerId === myId || joinedIds.includes(c.id)).length,
        followerCount: followerIds.length,
        followingCount: followingIds.length,
        attendanceStreak: signals.attendanceStreak,
        favoriteBookCount: favs.length,
      })
    }
    void load()
  }, [])

  const pickable = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ratings
      .filter((r) => !q || (r.title ?? '').toLowerCase().includes(q))
      .slice(0, 40)
  }, [ratings, query])

  async function commitFavorites(next: FavoriteBook[]) {
    const prev = favorites
    setFavorites(next)
    setStats((s) => (s ? { ...s, favoriteBookCount: next.length } : s))
    try {
      await replaceFavoriteBooks(next)
    } catch {
      setFavorites(prev)
      toast.error('인생책 저장에 실패했어요')
    }
  }

  function toggleFavorite(r: BookRatingRecord) {
    const exists = favorites.some((f) => f.bookId === r.bookId)
    if (exists) {
      void commitFavorites(favorites.filter((f) => f.bookId !== r.bookId))
      return
    }
    if (favorites.length >= 3) {
      toast.error('인생책은 3권까지예요')
      return
    }
    void commitFavorites([...favorites, { bookId: r.bookId, title: r.title ?? '제목 없음', thumbnail: null }])
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/my" />
          <span className="bj-h2">취향 리포트</span>
        </header>

        <div className="bj-content--lg">

          {/* 1. BOOKBTI — 유형 + 알파벳 코드 + 4축 스펙트럼 */}
          {myType && result ? (
            <section className="bj-card bj-report-hero">
              <div className="bj-report-hero__top">
                <div className="bj-report-hero__thumb">
                  <IllustPlaceholder code={myType.code} alt={myType.name} aspectRatio="1 / 1" />
                </div>
                <div className="bj-flex-1">
                  <p className="bj-display bj-display--lg">{myType.name}</p>
                  <div className="bj-report-hero__code">
                    <TypeBadge code={myType.code} />
                    <span className="bj-caption">{myType.rarityText}</span>
                  </div>
                  <p className="bj-caption bj-mt-4">{myType.tagline}</p>
                </div>
              </div>
              <div className="bj-report-hero__spectrums">
                {buildSpectrum(result).map((axis) => (
                  <SpectrumRow key={axis.left + axis.right} axis={axis} />
                ))}
              </div>
            </section>
          ) : (
            <section className="bj-card bj-card--empty-lg">
              <p className="bj-body bj-bold bj-mb-6">BOOKBTI부터 알아볼까요</p>
              <p className="bj-caption bj-mb-16">유형을 알아야 리포트가 채워져요</p>
              <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta">테스트 시작하기 →</Link>
            </section>
          )}

          {/* 2. 장르 비율 — 도넛 */}
          <SectionCard tag="장르 비율">
            {slices.length ? (
              <>
                <div className="bj-report-donut-row">
                  <GenreDonut slices={slices} />
                  <ul className="bj-donut-legend">
                    {slices.map((s, i) => (
                      <li key={s.name} className="bj-donut-legend__item">
                        <span className="bj-donut-legend__dot" style={{ background: genreTint(i, slices.length) }} />
                        <span className="bj-donut-legend__name">{s.name}</span>
                        <span className="bj-donut-legend__pct">{s.pct}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="bj-caption">장르를 아는 {genreTotal}권 기준</p>
              </>
            ) : (
              <p className="bj-caption">책에 별점을 남기면 장르 비율이 보여요</p>
            )}
          </SectionCard>

          {/* 3. 별점 성향 — 세로 분포 */}
          <SectionCard tag="별점 성향">
            <div className="bj-report-star-head">
              <div>
                <p className="bj-report-bignum">★{starProfile.avg.toFixed(1)}</p>
                <p className="bj-caption">평균 별점 · {ratings.length}권</p>
              </div>
              <div className="bj-report-star-verdict">
                <p className="bj-body bj-bold">{starProfile.label}</p>
                <p className="bj-caption">{starProfile.note}</p>
              </div>
            </div>
            <StarColumns distribution={starProfile.distribution} />
          </SectionCard>

          {/* 4. 인생책 3권 — 점수와 무관하게 직접 고른다 */}
          <SectionCard tag="인생책 3권">
            <div className="bj-lifebooks">
              {[0, 1, 2].map((i) => {
                const fav = favorites[i]
                return (
                  <div key={i} className={`bj-lifebook${fav ? '' : ' bj-lifebook--empty'}`}>
                    <span className="bj-lifebook__rank">{i + 1}</span>
                    {fav ? (
                      <>
                        <p className="bj-lifebook__title">{fav.title}</p>
                        <button
                          type="button"
                          className="bj-lifebook__remove"
                          aria-label={`${fav.title} 빼기`}
                          onClick={() => void commitFavorites(favorites.filter((f) => f.bookId !== fav.bookId))}
                        >
                          <Icon name="x" size={14} />
                        </button>
                      </>
                    ) : (
                      <p className="bj-lifebook__title bj-lifebook__title--empty">비어 있음</p>
                    )}
                  </div>
                )
              })}
            </div>

            {!loggedIn ? (
              <p className="bj-caption">로그인하면 인생책을 고를 수 있어요</p>
            ) : (
              <>
                <button
                  type="button"
                  className="bj-btn bj-btn--block bj-btn--block-sm"
                  onClick={() => setPicking((v) => !v)}
                >
                  {picking ? '닫기' : '내가 평가한 책에서 고르기'}
                </button>

                {picking && (
                  <div className="bj-lifebook-picker">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="책 제목 검색"
                      icon={<Icon name="search" size={16} />}
                    />
                    {ratings.length === 0 ? (
                      <p className="bj-caption bj-mt-8">아직 평가한 책이 없어요</p>
                    ) : (
                      <ul className="bj-lifebook-picker__list">
                        {pickable.map((r) => {
                          const on = favorites.some((f) => f.bookId === r.bookId)
                          return (
                            <li key={r.bookId}>
                              <button
                                type="button"
                                className={`bj-lifebook-pick${on ? ' bj-lifebook-pick--on' : ''}`}
                                onClick={() => toggleFavorite(r)}
                              >
                                <span className="bj-lifebook-pick__title">{r.title ?? '제목 없음'}</span>
                                <span className="bj-lifebook-pick__mark">
                                  <Icon name={on ? 'check' : 'plus'} size={16} />
                                </span>
                              </button>
                            </li>
                          )
                        })}
                        {pickable.length === 0 && <li className="bj-caption">찾는 책이 없어요</li>}
                      </ul>
                    )}
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* 5. 취향 키워드 */}
          <SectionCard tag="취향 키워드">
            {keywords.length ? (
              <div className="bj-tag-group">
                {keywords.map((k) => <span key={k} className="bj-chip">#{k}</span>)}
              </div>
            ) : (
              <p className="bj-caption">테스트와 별점이 쌓이면 키워드가 만들어져요</p>
            )}
          </SectionCard>

          {/* 6. 발견 성향 — 반원 게이지 */}
          <SectionCard tag="발견 성향">
            <div className="bj-report-gauge-row">
              <DiscoveryGauge pct={discovery.savePct} />
              <div>
                <p className="bj-body bj-bold">{discovery.label}</p>
                <p className="bj-caption">{discovery.note}</p>
                <p className="bj-caption bj-mt-4">담기 {discovery.saved} · 패스 {discovery.passed}</p>
              </div>
            </div>
          </SectionCard>

          {/* 7. 배지 — 획득/미획득을 같이 */}
          <section className="bj-card bj-report-card">
            <div className="bj-card-section-head--mb16">
              <span className="bj-section-tag">배지</span>
              <span className="bj-caption">{unlockedCount}/{badges.length}</span>
            </div>
            {stats ? (
              <>
                <div className="bj-medal-grid">
                  {badges.map(({ badge, unlocked }) => (
                    <BadgeMedal key={badge.key} badge={badge} unlocked={unlocked} />
                  ))}
                </div>
                <div className="bj-medal-legend">
                  {(['common', 'rare', 'legendary'] as const).map((tier) => (
                    <RarityBadge key={tier} variant={tier} label={BADGE_TIER_LABEL[tier]} size="xs" />
                  ))}
                </div>
              </>
            ) : (
              <p className="bj-caption">로그인하면 배지를 모을 수 있어요</p>
            )}
          </section>

        </div>
      </div>
    </main>
  )
}
