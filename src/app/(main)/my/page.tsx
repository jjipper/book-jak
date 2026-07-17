'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { loadResult } from '@/lib/scoring'
import { READING_TYPES } from '@/data/readingTypes'
import { BADGE_LIST } from '@/data/badges'
import { getAvatar, setAvatar, ensureNickname, setNickname } from '@/lib/profile'
import { getFollowingIds, getFollowerIds } from '@/lib/follows'
import { getLikedIds } from '@/lib/likes'
import { loadQuestions, loadAllAnswers } from '@/lib/discussions'
import { loadClubs, getJoinedIds } from '@/lib/clubs'
import { loadBlindRatings } from '@/lib/blindRatings'
import { loadBookRatings } from '@/lib/bookRatings'
import { loadWishlist } from '@/lib/wishlist'
import { BLIND_BOOKS } from '@/data/blindBooks'
import { ME_ID } from '@/lib/author'
import NicknameSheet from '@/components/social/NicknameSheet'
import ProfileAvatar from '@/components/social/ProfileAvatar'
import IllustPlaceholder from '@/components/illust/IllustPlaceholder'

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
    <Link href={href} className="bj-row" style={{ textDecoration: 'none', color: 'inherit', padding: '9px 14px' }}>
      <p className="bj-body" style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</p>
      <span className="bj-caption" style={{ fontWeight: 700 }}>{count}</span>
      <span style={{ color: 'var(--color-text-hint)', display: 'flex' }}><ChevronRightIcon /></span>
    </Link>
  )
}

export default function MyPage() {
  const [savedResult, setSavedResult] = useState<ReturnType<typeof loadResult>>(null)
  const [nickname, setNicknameState] = useState('')
  const [avatar, setAvatarState] = useState<string | null>(null)
  const [showNicknameSheet, setShowNicknameSheet] = useState(false)
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
    setSavedResult(loadResult())
    setNicknameState(ensureNickname())
    setAvatarState(getAvatar())
    setFollowingCount(getFollowingIds().length)
    setFollowerCount(getFollowerIds().length)
    setLikedCount(getLikedIds().length)
    setMyPostCount(loadQuestions().filter((q) => q.authorId === ME_ID).length)
    setMyCommentCount(loadAllAnswers().filter((a) => a.authorId === ME_ID).length)
    const joined = getJoinedIds()
    setMyClubCount(loadClubs().filter((c) => c.organizerId === ME_ID || joined.includes(c.id)).length)
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
  }, [])

  const myType = savedResult ? READING_TYPES[savedResult.typeCode] : null

  const unlockedBadges = BADGE_LIST.filter((b) => savedResult?.badgeCandidates?.includes(b.key))

  function handleAvatarChange(dataUrl: string) {
    setAvatar(dataUrl)
    setAvatarState(dataUrl)
  }

  return (
    <main className="bj-shell" style={{ minHeight: '100dvh' }}>
      <div className="bj-frame" style={{ maxWidth: 1120, margin: '0 auto' }}>
      {/* 헤더 */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-lg) 0 var(--space-md)' }}>
        <span className="bj-display bj-display--lg">마이</span>
        <button className="bj-icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <div style={{ padding: '0 0 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 프로필 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ProfileAvatar src={avatar} onChange={handleAvatarChange} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="bj-h2" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nickname}</span>
              <button
                type="button"
                onClick={() => setShowNicknameSheet(true)}
                aria-label="닉네임 수정"
                className="bj-icon-btn"
                style={{ width: 26, height: 26, color: 'var(--color-text-muted)' }}
              >
                <PencilIcon />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 2 }}>
              <Link href="/my/following" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="bj-body" style={{ fontWeight: 800, fontSize: 16 }}>{followingCount}</span>
                <span className="bj-caption" style={{ fontSize: 13 }}>팔로잉</span>
              </Link>
              <Link href="/my/followers" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'baseline', gap: 5 }}>
                <span className="bj-body" style={{ fontWeight: 800, fontSize: 16 }}>{followerCount}</span>
                <span className="bj-caption" style={{ fontSize: 13 }}>팔로워</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 테스트 결과 */}
        {myType && savedResult ? (
          <Link href={`/result/${savedResult.typeCode}?full=1`} className="bj-card" style={{ display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', color: 'inherit' }}>
            <div style={{ width: 64, flexShrink: 0 }}>
              <IllustPlaceholder code={myType.code} alt={myType.name} aspectRatio="1 / 1" />
            </div>
            <div>
              <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 4 }}>{myType.code}</p>
              <p className="bj-display bj-display--lg">{myType.name}</p>
              <p className="bj-caption" style={{ marginTop: 4 }}>내 결과 보기 →</p>
            </div>
          </Link>
        ) : (
          <div className="bj-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            <p className="bj-body" style={{ fontWeight: 700, marginBottom: 6 }}>아직 테스트 전이에요</p>
            <p className="bj-caption" style={{ marginBottom: 16 }}>나의 독서 유형을 먼저 알아보세요</p>
            <Link href="/test" className="bj-btn bj-btn--primary" style={{ padding: '12px 24px', fontSize: 14 }}>
              테스트 시작하기 →
            </Link>
          </div>
        )}

        {/* 스타일 분석 + 배지 — 데스크톱(≥900px)에서 2열 */}
        <div className="bj-list bj-list--lg-grid-2" style={{ gap: 16 }}>

        {/* 좋아하는 책 스타일 분석 */}
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>좋아하는 책 스타일 분석</span>
            <span className="bj-section-label__line" />
          </div>
          {styleTags.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 6 }}>선호 태그</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {styleTags.map((tag) => (
                    <span key={tag} className="bj-chip bj-chip--active">#{tag}</span>
                  ))}
                </div>
              </div>
              {favoriteGenres.length > 0 && (
                <div>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 6 }}>좋아하는 장르</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {favoriteGenres.map((genre) => (
                      <span key={genre} className="bj-chip">{genre}</span>
                    ))}
                  </div>
                </div>
              )}
              {favoriteAuthors.length > 0 && (
                <div>
                  <p className="bj-caption" style={{ fontWeight: 700, marginBottom: 6 }}>좋아하는 작가</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {favoriteAuthors.map((author) => (
                      <span key={author} className="bj-chip">{author}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="bj-caption" style={{ textAlign: 'center', padding: '8px 0 12px' }}>
                블라인드 북카드를 평가하면<br />내가 좋아하는 책 스타일을 분석해드려요
              </p>
              <Link href="/discover" className="bj-btn bj-btn--block" style={{ padding: '10px 0', fontSize: 13 }}>
                블라인드 북카드 평가하기
              </Link>
            </>
          )}
        </div>

        {/* 배지 섹션 */}
        <div className="bj-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>나의 배지</span>
            <span className="bj-section-label__line" />
            <span className="bj-caption">{unlockedBadges.length}/{BADGE_LIST.length}</span>
          </div>

          {unlockedBadges.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {unlockedBadges.map((badge) => (
                <span key={badge.key} className="bj-badge bj-badge--rare" style={{ justifyContent: 'center', padding: '8px 10px' }}>
                  {badge.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="bj-caption" style={{ textAlign: 'center' }}>테스트로 배지를 획득해보세요</p>
          )}
        </div>

        </div>

        {/* 보관함 + 활동 — 데스크톱(≥900px)에서 2열 */}
        <div className="bj-list bj-list--lg-grid-2" style={{ gap: 16 }}>

        {/* 보관함 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>보관함</span>
            <span className="bj-section-label__line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ActivityRow href="/my/rated" label="내가 읽고 별점 준 책" count={ratedCount} />
            <ActivityRow href="/my/wishlist" label="읽고 싶어요 한 책" count={wishCount} />
          </div>
        </div>

        {/* 활동 */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span className="bj-caption" style={{ fontWeight: 700, letterSpacing: '0.14em', color: 'var(--color-action)' }}>나의 활동</span>
            <span className="bj-section-label__line" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
          onSubmit={(name) => {
            setNickname(name)
            setNicknameState(name)
            setShowNicknameSheet(false)
          }}
        />
      )}
      </div>
    </main>
  )
}
