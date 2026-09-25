'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { loadResult } from '@/entities/reading-type/model/scoring'
import { READING_TYPES } from '@/entities/reading-type/model/readingTypes'
import { setAvatar, setNickname } from '@/entities/user/model/profile'
import { fetchProfile, upsertProfile, signOut } from '@/entities/user/api/profileRemote'
import { getFollowingIds, getFollowerIds } from '@/features/follow/model/follows'
import { loadMyPosts, loadLikedPosts } from '@/entities/post/api/myPostsRemote'
import { loadRanking } from '@/entities/person/api/personRemote'
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
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { toast } from '@/shared/lib/toast'
import './MyView.css'

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
  const [myRank, setMyRank] = useState<number | null>(null)
  const [ratedCount, setRatedCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const [discoverSaved, setDiscoverSaved] = useState(0)
  const [avgStars, setAvgStars] = useState(0)
  const [topGenres, setTopGenres] = useState<{ name: string; count: number }[]>([])

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
      const [followingIds, followerIds, likedPosts, myPosts, joinedIds, allClubs, feedComments, ranking] = await Promise.all([
        getFollowingIds(),
        getFollowerIds(),
        loadLikedPosts(),
        loadMyPosts(),
        getJoinedIds(),
        loadClubs(),
        loadMyComments(),
        loadRanking(),
      ])
      setFollowingCount(followingIds.length)
      setFollowerCount(followerIds.length)
      setLikedCount(likedPosts.length)
      setMyPostCount(myPosts.length)
      setMyCommentCount(feedComments.length)
      // ponytail: 상위 50명 안에서만 찾는다 — 밖이면 '순위 없음'. 사람이 늘면 뷰에 rank 컬럼을 두고 내 행만 조회
      const rankIdx = ranking.findIndex((r) => r.userId === profile.id)
      setMyRank(rankIdx >= 0 ? rankIdx + 1 : null)
      setMyClubCount(allClubs.filter((c) => c.organizerId === myId || joinedIds.includes(c.id)).length)

      const ratings = loadBookRatings()
      setRatedCount(ratings.length)
      setWishCount(loadWishlist().length)
      setAvgStars(ratings.length ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length : 0)

      const genreStats = new Map<string, number>()
      ratings.forEach((r) => {
        if (!r.categoryName) return
        genreStats.set(r.categoryName, (genreStats.get(r.categoryName) ?? 0) + 1)
      })
      setTopGenres(
        [...genreStats.entries()]
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5),
      )

      const { saved } = await getReactionCounts()
      setDiscoverSaved(saved)
    }
    void load()
  }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

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
          {nickname || '취향 리포트와 내 서재'}
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
            <p className="bj-caption bj-mb-16">나의 BOOKBTI를 먼저 알아보세요</p>
            <Link href="/test" className="bj-btn bj-btn--primary bj-btn--cta">
              테스트 시작
            </Link>
          </div>
        )}

        {/* 이번 주 랭킹 */}
        {loggedIn && (
          <Link href="/my/ranking" className="bj-row bj-row--compact bj-unstyled-link">
            <p className="bj-activity-label">이번 주 독서 랭킹</p>
            <span className="bj-caption bj-bold">{myRank ? `내 순위 ${myRank}위` : '순위 없음'}</span>
            <span className="bj-icon-hint"><Icon name="chevron-right" size={16} /></span>
          </Link>
        )}

        {/* 취향 리포트 — 요약만. 본편은 /my/report */}
        <div className="bj-card">
          <div className="bj-card-section-head">
            <span className="bj-section-tag">취향 리포트</span>
          </div>
          {!loggedIn ? (
            <LoginRequiredNote />
          ) : ratedCount > 0 || myType ? (
            <Link href="/my/report" className="bj-report-teaser">
              <div className="bj-report-teaser__mini" aria-hidden="true">
                {(topGenres.length ? topGenres : [{ name: '', count: 1 }]).slice(0, 4).map((g, i) => (
                  <span key={g.name || i} className="bj-report-teaser__bar">
                    <i style={{ width: `${Math.round((g.count / (topGenres[0]?.count ?? 1)) * 100)}%` }} />
                  </span>
                ))}
              </div>
              <div className="bj-report-teaser__body">
                <p className="bj-body bj-bold">
                  {myType ? myType.name : '내 독서 취향 한눈에'}
                </p>
                <div className="bj-report-teaser__facts">
                  {myType && <span className="bj-caption">BOOKBTI {myType.code}</span>}
                  <span className="bj-caption">평가 {ratedCount}권</span>
                  <span className="bj-caption">평균 ★{avgStars.toFixed(1)}</span>
                  <span className="bj-caption">발견 담기 {discoverSaved}</span>
                </div>
                <p className="bj-caption bj-mt-4">자세히 보기 →</p>
              </div>
            </Link>
          ) : (
            <>
              <p className="bj-caption bj-text-center bj-mb-12 bj-pt-8">
                책에 별점을 남기면<br />취향 리포트가 채워져요
              </p>
              <Link href="/rate" className="bj-btn bj-btn--block bj-btn--block-sm">
                책 평가하러 가기
              </Link>
            </>
          )}
        </div>

        {/* 보관함 + 활동 — 데스크톱(≥900px)에서 2열 */}
        <div className="bj-list bj-list--lg-grid-2">

        {/* 보관함 */}
        <div>
          <div className="bj-card-section-head--mb10">
            <span className="bj-section-tag">내 서재</span>
          </div>
          {loggedIn ? (
            <div className="bj-col-8">
              <ActivityRow href="/my/rated" label="별점 준 책" count={ratedCount} />
              <ActivityRow href="/my/wishlist" label="서재에 담은 책" count={wishCount} />
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
                      // 기기에 아무것도 남기지 않는다 — 유형은 계정에 백업돼 다음 로그인 때 복원된다.
                      // 남겨두면 공용 기기에서 다음 사람 계정에 섞인다.
                      localStorage.clear()
                      router.push('/home')
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
        message={loggedIn
          ? '이 기기에 저장된 BOOKBTI 결과와 활동 데이터가 삭제됩니다. 계정에 백업된 BOOKBTI는 다시 불러와져요. 계속할까요?'
          : 'BOOKBTI 테스트 결과와 평가, 글, 팔로우 등 이 기기에 저장된 모든 데이터가 삭제되고 복구할 수 없어요. 계속할까요?'}
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
