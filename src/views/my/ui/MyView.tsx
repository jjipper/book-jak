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
import { loadBlindRatings } from '@/entities/blind-rating/model/blindRatings'
import { loadBookRatings } from '@/entities/book-rating/model/bookRatings'
import { loadWishlist } from '@/features/wishlist/model/wishlist'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { getMyId } from '@/entities/user/model/profile'
import NicknameSheet from '@/features/nickname-gate/ui/NicknameSheet'
import ProfileAvatar from '@/entities/user/ui/ProfileAvatar'
import ConfirmSheet from '@/shared/ui/ConfirmSheet'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import { toast } from '@/shared/lib/toast'

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function ActivityRow({ href, label, count }: { href: string; label: string; count: number }) {
  return (
    <Link href={href} className="bj-row bj-row--compact bj-unstyled-link">
      <p className="bj-activity-label">{label}</p>
      <span className="bj-caption bj-bold">{count}</span>
      <span className="bj-icon-hint"><ChevronRightIcon /></span>
    </Link>
  )
}

export default function MyView() {
  const router = useRouter()
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [nickname, setNicknameState] = useState('')
  const [avatar, setAvatarState] = useState<string | null>(null)
  const [showNicknameSheet, setShowNicknameSheet] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [followingCount, setFollowingCount] = useState(0)
  const [followerCount, setFollowerCount] = useState(0)
  const [likedCount, setLikedCount] = useState(0)
  const [myPostCount, setMyPostCount] = useState(0)
  const [myCommentCount, setMyCommentCount] = useState(0)
  const [myClubCount, setMyClubCount] = useState(0)
  const [ratedCount, setRatedCount] = useState(0)
  const [wishCount, setWishCount] = useState(0)
  const [styleTags, setStyleTags] = useState<string[]>([])
  const [favoriteGenres, setFavoriteGenres] = useState<string[]>([])
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      setSavedResult(loadResult())
      fetchProfile().then((profile) => {
        if (profile) {
          setNicknameState(profile.nickname)
          setNickname(profile.nickname)
          if (profile.avatar_url) {
            setAvatarState(profile.avatar_url)
            setAvatar(profile.avatar_url)
          }
        }
      }).catch(() => toast.error('프로필 로드에 실패했어요'))

      const myId = getMyId()
      const [followingIds, followerIds, likedIds, allQuestions, allAnswers, joinedIds, allClubs] = await Promise.all([
        getFollowingIds(),
        getFollowerIds(),
        getLikedIds(),
        loadQuestions(),
        loadAllAnswers(),
        getJoinedIds(),
        loadClubs(),
      ])
      setFollowingCount(followingIds.length)
      setFollowerCount(followerIds.length)
      setLikedCount(likedIds.length)
      setMyPostCount(allQuestions.filter((q) => q.authorId === myId || q.authorId === 'me').length)
      setMyCommentCount(allAnswers.filter((a) => a.authorId === myId || a.authorId === 'me').length)
      setMyClubCount(allClubs.filter((c) => c.organizerId === myId || joinedIds.includes(c.id)).length)
      setRatedCount(loadBookRatings().length)
      setWishCount(loadWishlist().length)

      const ratings = loadBlindRatings()
      const tagFreq = new Map<string, number>()
      ratings.forEach((r) => r.tags.forEach((tag) => tagFreq.set(tag, (tagFreq.get(tag) ?? 0) + 1)))
      setStyleTags([...tagFreq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag]) => tag))

      const liked = ratings.filter((r) => r.stars >= 4)
      const source = liked.length > 0 ? liked : ratings
      const genreFreq = new Map<string, number>()
      const authorFreq = new Map<string, number>()
      source.forEach((r) => {
        const book = BLIND_BOOKS.find((b) => b.id === r.bookId)
        if (!book) return
        authorFreq.set(book.author, (authorFreq.get(book.author) ?? 0) + 1)
        book.tags.filter((t) => t.kind === 'genre').forEach((t) => genreFreq.set(t.text, (genreFreq.get(t.text) ?? 0) + 1))
      })
      setFavoriteGenres([...genreFreq.entries()].sort((a, b) => b[1] - a[1]).map(([g]) => g))
      setFavoriteAuthors([...authorFreq.entries()].sort((a, b) => b[1] - a[1]).map(([a]) => a))
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
      <header className="bj-my-header">
        <span className="bj-display bj-display--lg">마이</span>
        <button className="bj-icon-btn" onClick={() => setShowSettings(true)} aria-label="설정">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div className="bj-content--lg">

        {/* 프로필 */}
        <div className="bj-my-profile">
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
                <PencilIcon />
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
        </div>

        {/* 테스트 결과 */}
        {myType && savedResult ? (
          <Link href={`/result/${savedResult.typeCode}?full=1`} className="bj-card bj-my-result-link">
            <div className="bj-my-result-thumb">
              <IllustPlaceholder code={myType.code} alt={myType.name} aspectRatio="1 / 1" />
            </div>
            <div>
              <p className="bj-caption bj-bold bj-mb-4">{myType.code}</p>
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
            <span className="bj-section-label__line" />
          </div>
          {styleTags.length > 0 ? (
            <div className="bj-col-14">
              <div>
                <p className="bj-caption bj-bold bj-mb-6">선호 태그</p>
                <div className="bj-tag-group">
                  {styleTags.map((tag) => (
                    <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
                  ))}
                </div>
              </div>
              {favoriteGenres.length > 0 && (
                <div>
                  <p className="bj-caption bj-bold bj-mb-6">좋아하는 장르</p>
                  <div className="bj-tag-group">
                    {favoriteGenres.map((genre) => (
                      <span key={genre} className="bj-chip">{genre}</span>
                    ))}
                  </div>
                </div>
              )}
              {favoriteAuthors.length > 0 && (
                <div>
                  <p className="bj-caption bj-bold bj-mb-6">좋아하는 작가</p>
                  <div className="bj-tag-group">
                    {favoriteAuthors.map((author) => (
                      <span key={author} className="bj-chip">{author}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="bj-caption bj-text-center bj-mb-12 bj-pt-8">
                블라인드 북카드를 평가하면<br />내가 좋아하는 책 스타일을 분석해드려요
              </p>
              <Link href="/discover" className="bj-btn bj-btn--block bj-btn--block-sm">
                블라인드 북카드 평가하기
              </Link>
            </>
          )}
        </div>

        {/* 배지 섹션 */}
        <div className="bj-card">
          <div className="bj-card-section-head--mb16">
            <span className="bj-section-tag">나의 배지</span>
            <span className="bj-section-label__line" />
            <span className="bj-caption">{unlockedBadges.length}/{BADGE_LIST.length}</span>
          </div>

          {unlockedBadges.length > 0 ? (
            <div className="bj-badge-grid">
              {unlockedBadges.map((badge) => (
                <span key={badge.key} className="bj-badge bj-badge--rare bj-badge--centered">
                  {badge.name}
                </span>
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
            <span className="bj-section-label__line" />
          </div>
          <div className="bj-col-8">
            <ActivityRow href="/my/rated" label="내가 읽고 별점 준 책" count={ratedCount} />
            <ActivityRow href="/my/wishlist" label="읽고 싶어요 한 책" count={wishCount} />
          </div>
        </div>

        {/* 활동 */}
        <div>
          <div className="bj-card-section-head--mb10">
            <span className="bj-section-tag">나의 활동</span>
            <span className="bj-section-label__line" />
          </div>
          <div className="bj-col-8">
            <ActivityRow href="/my/likes" label="좋아요 한 글" count={likedCount} />
            <ActivityRow href="/my/posts" label="남긴 글" count={myPostCount} />
            <ActivityRow href="/my/comments" label="남긴 댓글" count={myCommentCount} />
            <ActivityRow href="/my/clubs" label="신청한 모임" count={myClubCount} />
          </div>
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
