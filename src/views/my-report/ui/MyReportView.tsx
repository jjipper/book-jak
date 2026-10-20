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
import { Icon, Input, RarityBadge, Segmented, SubpageHead, TypeBadge } from '@/shared/ui'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import BadgeMedal from './BadgeMedal'
import { toast } from '@/shared/lib/toast'
import './MyReportView.css'

/* ──────────────────────────────────────────────────────────────
   차트 조각들 — SVG 직접. 카드마다 형태를 달리해 스크롤을 지루하지 않게.
   ────────────────────────────────────────────────────────────── */

/** 장르 조각별 주황 농도 — 강조색은 하나라는 규칙을 지키면서 구분은 만든다.
    흰 면에 섞어 시안 4단계(#F0562E → #F58B6B → #F9B9A4 → #FBDFD5)가 나오는 비율, 5번째부터는 차트 트랙 */
const DONUT_DENSITY = [100, 67, 40, 27]
function genreTint(i: number): string {
  const mix = DONUT_DENSITY[i]
  return mix === undefined
    ? 'var(--color-chart-track)'
    : `color-mix(in srgb, var(--color-accent) ${mix}%, var(--color-surface))`
}

/* 도넛 160 · 링 22 → 반지름 69 · 조각 사이 2° */
const DONUT_R = 69
const DONUT_C = 2 * Math.PI * DONUT_R
const DONUT_GAP = DONUT_C * (2 / 360)

function GenreDonut({ slices }: { slices: GenreSlice[] }) {
  // 조각 시작 지점은 앞 조각들의 길이 합. 간격은 조각 양끝에서 반씩 뺀다
  const arcs = slices.reduce<{ name: string; len: number; offset: number }[]>((acc, s) => {
    const prev = acc[acc.length - 1]
    const offset = prev ? prev.offset + prev.len : 0
    acc.push({ name: s.name, len: (s.pct / 100) * DONUT_C, offset })
    return acc
  }, [])

  return (
    <svg viewBox="0 0 160 160" className="bj-donut" role="img"
      aria-label={slices.map((s) => `${s.name} ${s.pct}%`).join(', ')}>
      {arcs.map((a, i) => {
        const len = Math.max(0, a.len - DONUT_GAP)
        return (
          <circle
            key={a.name}
            cx="80" cy="80" r={DONUT_R}
            className="bj-donut__arc"
            style={{ stroke: genreTint(i) }}
            strokeDasharray={`${len} ${DONUT_C - len}`}
            strokeDashoffset={-(a.offset + DONUT_GAP / 2)}
          />
        )
      })}
      <text x="80" y="72" className="bj-donut__center-label">{slices[0]?.name ?? ''}</text>
      <text x="80" y="98" className="bj-donut__center-num">{slices[0]?.pct ?? 0}%</text>
    </svg>
  )
}

/** 별점 분포 — 세그먼티드 pill. ★5부터 진한 주황 순 */
function StarSegments({ distribution }: { distribution: readonly number[] }) {
  const desc = [...distribution].reverse()
  return (
    <div className="bj-col-6">
      <Segmented segments={desc} label={desc.map((n, i) => `${5 - i}점 ${n}권`).join(', ')} />
      <ul className="bj-report-seg-labels">
        {desc.map((n, i) => <li key={i}>★{5 - i} {n}</li>)}
      </ul>
    </div>
  )
}

/** 가로 게이지 — 라벨 14 + 우측 칩 · 바 10 · 값 20 Bold */
function DiscoveryGauge({ pct, chip }: { pct: number; chip: string }) {
  return (
    <div className="bj-gauge" role="img" aria-label={`담기 비율 ${pct}%`}>
      <div className="bj-gauge__head">
        <span>담기 비율</span>
        <span className="bj-gauge__chip">{chip}</span>
      </div>
      <div className="bj-gauge__track">
        <div className="bj-gauge__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="bj-gauge__num">{pct}%</p>
    </div>
  )
}

function SpectrumRow({ axis }: { axis: AxisSpectrum }) {
  const leftWins = axis.picked === axis.left
  return (
    <div className="bj-spectrum">
      <div className="bj-spectrum__ends">
        <span className={`bj-spectrum__end${leftWins ? ' bj-spectrum__end--on' : ''}`}>
          {axis.leftLabel}
        </span>
        <span className={`bj-spectrum__end${leftWins ? '' : ' bj-spectrum__end--on'}`}>
          {axis.rightLabel}
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
        <SubpageHead title="취향 리포트" backHref="/my" />

        <div className="bj-content--lg">

          {/* 1. BOOKBTI — 유형 + 알파벳 코드 + 4축 스펙트럼 */}
          {myType && result ? (
            <section className="bj-card bj-card--spotlight bj-report-hero">
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
              <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta">테스트 시작</Link>
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
                        <span className="bj-donut-legend__dot" style={{ background: genreTint(i) }} />
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
                <p className="bj-caption">평가한 {ratings.length}권의 평균</p>
              </div>
              <div className="bj-report-star-verdict">
                <p className="bj-body bj-bold">{starProfile.label}</p>
                <p className="bj-caption">{starProfile.note}</p>
              </div>
            </div>
            <StarSegments distribution={starProfile.distribution} />
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
              <DiscoveryGauge pct={discovery.savePct} chip={discovery.label} />
              <div>
                <p className="bj-caption">{discovery.note}</p>
                <p className="bj-caption bj-mt-4">{discovery.saved}권 담고 {discovery.passed}권 넘겼어요</p>
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
