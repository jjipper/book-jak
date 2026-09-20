'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { BADGE_LIST } from '@/entities/reading-type/model/badges'
import { setAvatar, setNickname } from '@/entities/user/model/profile'
import { fetchProfile, upsertProfile, signOut } from '@/entities/user/api/profileRemote'
import { getFollowingIds, getFollowerIds } from '@/features/follow/model/follows'
import { getLikedIds } from '@/features/like/model/likes'
import { loadQuestions, loadAllAnswers } from '@/entities/discussion/model/discussionActions'
import { loadClubs, getJoinedIds } from '@/entities/club/model/clubActions'
import { loadMyComments } from '@/entities/post/api/commentsRemote'
import { deleteMyAccount } from '@/entities/user/api/accountRemote'
import { loadBookRatings } from '@/entities/book-rating/model/bookRatings'
import { getReactionCounts } from '@/entities/blind-book/model/blindReactions'
import { loadWishlist } from '@/features/wishlist/model/wishlist'
import { getMyId } from '@/entities/user/model/profile'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import ProfileAvatar from '@/entities/user/ui/ProfileAvatar'
import ConfirmSheet from '@/shared/ui/ConfirmSheet'
import Icon from '@/shared/ui/Icon'
import TypeBadge from '@/shared/ui/TypeBadge'
import RarityBadge from '@/shared/ui/RarityBadge'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { toast } from '@/shared/lib/toast'

function ActivityRow({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="bj-row bj-row--compact bj-unstyled-link">
      <p className="bj-activity-label">{label}</p>
      <span className="bj-caption bj-bold">{count}</span>
      <span className="bj-icon-hint"><Icon name="chevron-right" size={16} /></span>
    </Link>
  )
}

function LoginRequiredNote() {
  return (
    <div className="bj-card--empty-lg">
      <p className="bj-caption bj-text-center bj-mb-12">로그인하면 내 기록을 볼 수 있어요</p>
      <Link href="/login?next=/my" className="bj-btn bj-btn--block bj-btn--block-sm">
        로그인하기
      </Link>
    </div>
  )
}

export default function MyView() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [nickname, setNicknameState] = useState('')
  const [avatar, setAvatarState] = useState<string | null>(null)
  const [showNicknameSheet, setShowNicknameSheet] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false)
  const [followingCount, setFollowingCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [likedCount, setLikedCount] = useState(0)
  const [myPostCount, setMyPostCount] = useState(0)
  const [myCommentCount, setMyCommentCount] = useState(0)
  const [myClubCount, setMyClubCount] = useState(0)
  const [ratedCount, setRatedCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const [discoverSaved, setDiscoverSaved] = useState(0)
  const [discoverPassed, setDiscoverPassed] = useState(0)
  const [avgStars, setAvgStars] = useState(0)
  const [topGenres, setTopGenres] = useState<{ name: string; count: number; avgStars: number }[]>([])

  useEffect(() => {
    async function load() {
      setSavedResult(loadResult())

      let profile: Awaited<ReturnType<typeof fetchProfile>> = null
      try {
        profile = await fetchProfile()
      } catch {
        toast.error('프로필 로드에 실패했어요')
      }
      if (!profile) return
      setLoggedIn(true)
      setNicknameState(profile.nickname)
      setNickname(profile.nickname)
      if (profile.avatar_url) {
        setAvatarState(profile.avatar_url)
        setAvatar(profile.avatar_url)
      }

      const myId = getMyId()
      const [followingIds, followerIds, likedIds, allQuestions, allAnswers, joinedIds, allClubs, feedComments] = await Promise.all([
        getFollowingIds(),
        getFollowerIds(),
        getLikedIds(),
        loadQuestions(),
        loadAllAnswers(),
        getJoinedIds(),
        loadClubs(),
        loadMyComments(),
      ])
      setFollowingCount(followingIds.length)
      setFollowerCount(followerIds.length)
      setLikedCount(likedIds.length)
      setMyPostCount(allQuestions.filter((q) => q.authorId === myId).length)
      setMyCommentCount(allAnswers.filter((a) => a.authorId === myId).length + feedComments.length)
      setMyClubCount(allClubs.filter((c) => c.organizerId === myId || joinedIds.includes(c.id)).length)

      const ratings = loadBookRatings()
      setRatedCount(ratings.length)
      setWishCount(loadWishlist().length)
      setAvgStars(ratings.length ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length : 0)

      const genreStats = new Map<string, { count: number; totalStars: number }>()
      ratings.forEach((r) => {
        if (!r.categoryName) return
        const cur = genreStats.get(r.categoryName) ?? { count: 0, totalStars: 0 }
        cur.count += 1
        cur.totalStars += r.stars
        genreStats.set(r.categoryName, cur)
      })
      setTopGenres(
        [...genreStats.entries()]
          .map(([name, { count, totalStars }]) => ({ name, count, avgStars: totalStars / count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      )

      const { saved, passed } = await getReactionCounts()
      setDiscoverSaved(saved)
      setDiscoverPassed(passed)
    }
    void load()
  }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

  const unlockedBadges = BADGE_LIST.filter((b) => savedResult?.badgeCandidates?.includes(b.key))

  async function handleAvatarChange(dataUrl: string) {
    setAvatarState(dataUrl)
    setAvatar(dataUrl)
    try {
      await upsertProfile(nickname, dataUrl)
    } catch {
      toast.error('프로필 사진 저장에 실패했어요')
    }
  }

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      {/* 헤더 */}
      <header className="bj-page-head">
        <div className="bj-my-header">
          <span className="bj-display bj-display--lg">마이</span>
          <button className="bj-icon-btn" onClick={() => setShowSettings(true)} aria-label="설정">
            <Icon name="settings" size={24} />
          </button>
        </div>
        <p className="bj-caption">
          {nickname ? `${nickname} · ` : ''}취향 리포트와 보관함
        </p>
      </header>

      <div className="bj-content--lg">

        {/* 프로필 */}
        <div className="bj-my-profile">
          {loggedIn ? (
            <>
              <ProfileAvatar src={avatar} onChange={handleAvatarChange} />
              <div className="bj-flex-1">
                <div className="bj-my-nickname-row">
                  <span className="bj-h2 bj-truncate">{nickname}</span>
                  <button
                    type="button"
                    onClick={() => setShowNicknameSheet(true)}
                    aria-label="닉네임 수정"
                    className="bj-icon-btn bj-icon-btn--sm"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                </div>
                <div className="bj-my-stats">
                  <Link href="/my/following" className="bj-my-stat-link">
                    <span className="bj-stat-num">{followingCount}</span>
                    <span className="bj-caption">팔로잉</span>
                  </Link>
                  <Link href="/my/followers" className="bj-my-stat-link">
                    <span className="bj-stat-num">{followerCount}</span>
                    <span className="bj-caption">팔로워</span>
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="bj-flex-1">
              <p className="bj-h2 bj-mb-8">로그인이 필요해요</p>
              <p className="bj-caption bj-mb-12">로그인하고 더 많은 기능을 써보세요</p>
              <Link href="/login?next=/my" className="bj-btn bj-btn--primary bj-btn--sm">
                로그인하기
              </Link>
            </div>
          )}
        </div>

        {/* 테스트 결과 */}
        {myType && savedResult ? (
          <Link href={`/result/${savedResult.typeCode}`} className="bj-card bj-my-result-link">
            <div className="bj-my-result-thumb">
              <IllustPlaceholder code={myType.code} alt={myType.name} aspectRatio="1 / 1" />
            </div>
            <div>
              <div className="bj-mb-8"><TypeBadge code={myType.code} /></div>
              <p className="bj-display bj-display--lg">{myType.name}</p>
              <p className="bj-caption bj-mt-4">내 결과 보기 →</p>
            </div>
          </Link>
        ) : (
          <div className="bj-card bj-card--empty-lg">
            <p className="bj-body bj-bold bj-mb-6">아직 테스트 전이에요</p>
            <p className="bj-caption bj-mb-16">나의 독서 유형을 먼저 알아보세요</p>
            <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta">
              테스트 시작하기 →
            </Link>
          </div>
        )}

        {/* 스타일 분석 + 배지 — 데스크톱(≥900px)에서 2열 */}
        <div className="bj-list bj-list--lg-grid-2">

        {/* 좋아하는 책 스타일 분석 */}
        <div className="bj-card">
          <div className="bj-card-section-head">
            <span className="bj-section-tag">좋아하는 책 스타일 분석</span>
          </div>
          {!loggedIn ? (
            <LoginRequiredNote />
          ) : topGenres.length > 0 ? (
            <div className="bj-col-14">
              <div className="bj-report-stats">
                <div className="bj-report-stat">
                  <span className="bj-report-stat__num bj-report-stat__num--accent">{ratedCount}</span>
                  <span className="bj-report-stat__label">평가한 책</span>
                </div>
                <div className="bj-report-stat">
                  <span className="bj-report-stat__num">★{avgStars.toFixed(1)}</span>
                  <span className="bj-report-stat__label">평균 별점</span>
                </div>
                <div className="bj-report-stat">
                  <span className="bj-report-stat__num">{discoverSaved}</span>
                  <span className="bj-report-stat__label">발견 저장</span>
                </div>
              </div>
              <div className="bj-genre-bars">
                {topGenres.map((genre) => (
                  <div key={genre.name} className="bj-genre-bar-row">
                    <span className="bj-genre-bar__label">{genre.name}</span>
                    <div className="bj-genre-bar__track">
                      <div
                        className="bj-genre-bar__fill"
                        style={{ width: `${Math.round((genre.count / topGenres[0].count) * 100)}%` }}
                      />
                    </div>
                    <span className="bj-genre-bar__meta">★{genre.avgStars.toFixed(1)}</span>
                  </div>
                ))}
              </div>
              <p className="bj-caption">발견 탭에서 패스 {discoverPassed}권</p>
            </div>
          ) : (
            <>
              <p className="bj-caption bj-text-center bj-mb-12 bj-pt-8">
                책에 별점을 남기면<br />내가 좋아하는 장르를 분석해드려요
              </p>
              <Link href="/rate" className="bj-btn bj-btn--block bj-btn--block-sm">
                책 평가하러 가기
              </Link>
            </>
          )}
        </div>

        {/* 배지 섹션 */}
        <div className="bj-card">
          <div className="bj-card-section-head--mb16">
            <span className="bj-section-tag">나의 배지</span>
            <span className="bj-caption">{unlockedBadges.length}/{BADGE_LIST.length}</span>
          </div>

          {unlockedBadges.length > 0 ? (
            <div className="bj-badge-grid">
              {unlockedBadges.map((badge) => (
                <RarityBadge key={badge.key} variant="common" label={badge.name} size="sm" />
              ))}
            </div>
          ) : (
            <p className="bj-caption bj-text-center">테스트로 배지를 획득해보세요</p>
          )}
        </div>

        </div>

        {/* 보관함 + 활동 — 데스크톱(≥900px)에서 2열 */}
        <div className="bj-list bj-list--lg-grid-2">

        {/* 보관함 */}
        <div>
          <div className="bj-card-section-head--mb10">
            <span className="bj-section-tag">보관함</span>
          </div>
          {loggedIn ? (
            <div className="bj-col-8">
              <ActivityRow href="/my/rated" label="내가 읽고 별점 준 책" count={ratedCount} />
              <ActivityRow href="/my/wishlist" label="읽고 싶어요 한 책" count={wishCount} />
            </div>
          ) : (
            <LoginRequiredNote />
          )}
        </div>

        {/* 활동 */}
        <div>
          <div className="bj-card-section-head--mb10">
            <span className="bj-section-tag">나의 활동</span>
          </div>
          {loggedIn ? (
            <div className="bj-col-8">
              <ActivityRow href="/my/likes" label="좋아요 한 글" count={likedCount} />
              <ActivityRow href="/my/posts" label="남긴 글" count={myPostCount} />
              <ActivityRow href="/my/comments" label="남긴 댓글" count={myCommentCount} />
              <ActivityRow href="/my/clubs" label="신청한 모임" count={myClubCount} />
            </div>
          ) : (
            <LoginRequiredNote />
          )}
        </div>

        </div>
      </div>

      {showNicknameSheet && (
        <NicknameSheet
          initialValue={nickname}
          onClose={() => setShowNicknameSheet(false)}
          onSubmit={async (name) => {
            try {
              await upsertProfile(name)
            } catch {
              toast.error('닉네임 변경에 실패했어요')
            }
            setNickname(name)
            setNicknameState(name)
            setShowNicknameSheet(false)
          }}
        />
      )}

      {showSettings && (
        <div className="bj-sheet__overlay" onClick={() => setShowSettings(false)}>
          <div className="bj-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="bj-sheet-header">
              <p className="bj-h2">설정</p>
              <button onClick={() => setShowSettings(false)} className="bj-icon-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="bj-col-16">
              <div className="bj-card--flat">
                <p className="bj-display bj-display--lg bj-settings-app-name">북작</p>
                <p className="bj-caption">취향으로 북적이는 독서 취향 소셜</p>
                <p className="bj-caption bj-settings-version">v2 프리뷰</p>
              </div>

              <div>
                <p className="bj-caption bj-settings-section-label">계정</p>
                {loggedIn ? (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut()
                      } catch {
                        toast.error('로그아웃에 실패했어요')
                        return
                      }
                      localStorage.clear()
                      router.push('/login')
                    }}
                    className="bj-btn bj-btn--block bj-btn--tall"
                  >
                    로그아웃
                  </button>
                ) : (
                  <Link href="/login?next=/my" className="bj-btn bj-btn--primary bj-btn--block bj-btn--tall">
                    로그인하기
                  </Link>
                )}
                {loggedIn && (
                  <button
                    type="button"
                    onClick={() => setShowWithdrawConfirm(true)}
                    className="bj-btn bj-btn--block bj-btn--tall bj-mt-8"
                  >
                    회원 탈퇴
                  </button>
                )}
              </div>

              <div>
                <p className="bj-caption bj-settings-section-label">데이터</p>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="bj-btn bj-btn--block bj-btn--tall"
                >
                  데이터 전체 초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmSheet
        open={showWithdrawConfirm}
        message="탈퇴하면 계정과 프로필 정보(닉네임·사진·소개)가 삭제되고 복구할 수 없어요. 대화 흐름을 위해 작성한 글과 댓글은 '탈퇴한 사용자'로 남습니다. 탈퇴할까요?"
        confirmLabel="탈퇴하기"
        cancelLabel="취소"
        onConfirm={async () => {
          try {
            await deleteMyAccount()
          } catch {
            toast.error('탈퇴 처리에 실패했어요')
            return
          }
          localStorage.clear()
          window.location.href = '/'
        }}
        onCancel={() => setShowWithdrawConfirm(false)}
      />

      <ConfirmSheet
        open={showResetConfirm}
        message="평가, 글, 팔로우 등 모든 활동 데이터가 삭제됩니다. 계속할까요?"
        confirmLabel="초기화"
        cancelLabel="취소"
        onConfirm={() => {
          localStorage.clear()
          window.location.href = '/'
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
      </div>
    </main>
  )
}
