// 배지 카탈로그 + 획득 판정.
//
// 두 종류가 섞여 있다.
//  - 'answer'  : 진단 테스트 4지선다에서 수집되는 12개 (scoring.collectBadges → badgeCandidates)
//  - 'stat'    : 활동 기록으로 판정되는 나머지 (평가·후기·블라인드·추천·글·모임·팔로우·출석·유형)
//
// 그래픽은 /assets/badge/{key}.png. 파일이 없으면 화면이 등급별 기본 도형+이니셜로 대체한다
// (BadgeMedal, IllustPlaceholder와 같은 onError 패턴) — 깨진 이미지를 내보내지 않는다.
//
// 배지는 닉네임 옆에 붙이지 않는다. 프로필·취향 리포트 안에서만 보여준다.

/** 흔함 / 희귀 / 최희귀 — RarityBadge의 variant와 같은 축 */
export type BadgeTier = 'common' | 'rare' | 'legendary'

export const BADGE_TIER_LABEL: Record<BadgeTier, string> = {
  common: '흔함',
  rare: '희귀',
  legendary: '최희귀',
}

/** 배지 판정에 필요한 집계값. 모르는 값은 0으로 둔다(=미획득). */
export interface BadgeStats {
  /** 테스트 답변에서 모인 badgeKey 목록 */
  answerBadges: string[]
  hasTestResult: boolean
  /** 내 유형 희소도 % (작을수록 희귀) */
  typeRarityPct: number | null
  ratedCount: number
  reviewCount: number
  avgStars: number
  genreCount: number
  /** 가장 많이 읽은 장르가 차지하는 비율 0~1 */
  topGenreShare: number
  blindRevealed: number
  blindSaved: number
  blindPassed: number
  wishCount: number
  recCount: number
  postCount: number
  commentCount: number
  clubCount: number
  followerCount: number
  followingCount: number
  /** 오늘(또는 어제)까지 이어진 연속 출석 일수 */
  attendanceStreak: number
  favoriteBookCount: number
}

export interface Badge {
  key: string
  name: string
  desc: string
  /** 화면에 그대로 노출되는 획득 조건 문구 */
  condition: string
  tier: BadgeTier
  /** public/assets/badge/{image} */
  image: string
  /** 획득 판정. 없으면 answerBadges 포함 여부로 판정한다 */
  check?: (s: BadgeStats) => boolean
}

function badge(
  key: string,
  name: string,
  desc: string,
  condition: string,
  tier: BadgeTier,
  check?: (s: BadgeStats) => boolean,
): Badge {
  return { key, name, desc, condition, tier, image: `${key}.png`, check }
}

export const BADGE_LIST: Badge[] = [
  // ── 진단 테스트 답변으로 얻는 배지 (12) ──────────────────────────────
  badge('bookmark-prisoner', '책갈피 수감자', '읽다 멈추기 반복', '테스트에서 해당 답변 선택', 'common'),
  badge('daydream-reader', '몽상 독서가', '읽는 척 딴생각', '테스트에서 해당 답변 선택', 'common'),
  badge('interrupted-thinker', '방해 환영러', '말 걸림이 오히려 생각 자극', '테스트에서 해당 답변 선택', 'common'),
  badge('reluctant-reader', '휴식 반가움러', '방해를 휴식 기회로 씀', '테스트에서 해당 답변 선택', 'common'),
  badge('selective-reader', '취사선택 리더', '흥미로운 부분만 속독', '테스트에서 해당 답변 선택', 'common'),
  badge('slow-deep-diver', '슬로우 다이버', '한 권에 몇 달', '테스트에서 해당 답변 선택', 'common'),
  badge('mood-reader', '무드 리더', '분위기로 책 고름', '테스트에서 해당 답변 선택', 'common'),
  badge('reluctant-grower', '얼결에 성장러', '추천받았다가 뜻밖의 변화', '테스트에서 해당 답변 선택', 'common'),
  badge('knowledge-hunter', '지식 수집가', '지식 위주 독서', '테스트에서 해당 답변 선택', 'common'),
  badge('genre-nomad', '장르 유목민', '장르 안 가림', '테스트에서 해당 답변 선택', 'common'),
  badge('worldbuilder-fan', '세계관 팬', '설정집까지 읽음', '테스트에서 해당 답변 선택', 'common'),
  badge('character-first', '캐릭터 퍼스트', '인물이 최우선', '테스트에서 해당 답변 선택', 'common'),

  // ── 시작 ────────────────────────────────────────────────────────────
  badge('bookbti-done', '나를 알았다', 'BOOKBTI 테스트 완주', '테스트 1회 완료', 'common',
    (s) => s.hasTestResult),
  badge('rare-type', '희귀 유형', '흔치 않은 독서 유형', '내 유형 희소도 5% 이하', 'rare',
    (s) => s.typeRarityPct !== null && s.typeRarityPct <= 5),

  // ── 평가 ────────────────────────────────────────────────────────────
  badge('first-rating', '첫 별점', '처음으로 책에 별을 달았다', '책 1권 평가', 'common',
    (s) => s.ratedCount >= 1),
  badge('rating-10', '열 권의 서재', '평가한 책 10권', '책 10권 평가', 'common',
    (s) => s.ratedCount >= 10),
  badge('rating-50', '오십 권의 서재', '평가한 책 50권', '책 50권 평가', 'rare',
    (s) => s.ratedCount >= 50),
  badge('rating-100', '백 권 클럽', '평가한 책 100권', '책 100권 평가', 'legendary',
    (s) => s.ratedCount >= 100),
  badge('generous-reader', '별점 요정', '웬만하면 별 다섯', '10권 이상 평가 · 평균 4.3점 이상', 'common',
    (s) => s.ratedCount >= 10 && s.avgStars >= 4.3),
  badge('harsh-critic', '깐깐한 심사위원', '별 하나도 아깝다', '10권 이상 평가 · 평균 2.7점 이하', 'rare',
    (s) => s.ratedCount >= 10 && s.avgStars > 0 && s.avgStars <= 2.7),

  // ── 후기 ────────────────────────────────────────────────────────────
  badge('first-review', '첫 후기', '처음으로 한 줄을 남겼다', '후기 1개 작성', 'common',
    (s) => s.reviewCount >= 1),
  badge('review-20', '후기 장인', '말없이 못 지나간다', '후기 20개 작성', 'rare',
    (s) => s.reviewCount >= 20),

  // ── 장르 ────────────────────────────────────────────────────────────
  badge('genre-explorer', '장르 탐험가', '가리는 장르가 없다', '서로 다른 장르 5종 이상 평가', 'common',
    (s) => s.genreCount >= 5),
  badge('genre-monogamist', '편식 독서가', '한 우물만 판다', '10권 이상 평가 · 한 장르가 60% 이상', 'common',
    (s) => s.ratedCount >= 10 && s.topGenreShare >= 0.6),
  badge('genre-omnivore', '잡식 독서가', '장르 열 개를 돌았다', '서로 다른 장르 10종 이상 평가', 'legendary',
    (s) => s.genreCount >= 10),

  // ── 발견(블라인드 북) ───────────────────────────────────────────────
  badge('blind-first', '첫 개봉', '블라인드 북을 처음 열었다', '블라인드 북 1권 공개', 'common',
    (s) => s.blindRevealed >= 1),
  badge('blind-10', '개봉 전문가', '표지를 열 번 벗겼다', '블라인드 북 10권 공개', 'rare',
    (s) => s.blindRevealed >= 10),
  badge('blind-adventurer', '모험가', '일단 담고 본다', '블라인드 반응 10회 이상 · 담기 비율 70% 이상', 'rare',
    (s) => s.blindSaved + s.blindPassed >= 10 && s.blindSaved / (s.blindSaved + s.blindPassed) >= 0.7),
  badge('blind-skeptic', '신중파', '고르고 골라 담는다', '블라인드 반응 10회 이상 · 담기 비율 30% 이하', 'rare',
    (s) => s.blindSaved + s.blindPassed >= 10 && s.blindSaved / (s.blindSaved + s.blindPassed) <= 0.3),

  // ── 서재 ────────────────────────────────────────────────────────────
  badge('shelf-10', '서재 수집가', '읽을 책을 쟁여둔다', '서재에 10권 담기', 'common',
    (s) => s.wishCount >= 10),
  badge('shelf-50', '적독 장인', '쌓아두는 것도 취미', '서재에 50권 담기', 'legendary',
    (s) => s.wishCount >= 50),
  badge('life-books', '인생책 확정', '세 권을 겨우 골랐다', '인생책 3권 모두 선택', 'common',
    (s) => s.favoriteBookCount >= 3),

  // ── 추천 ────────────────────────────────────────────────────────────
  badge('rec-first', '첫 추천', '남의 책장에 한 권 꽂았다', '책 추천 1개 작성', 'common',
    (s) => s.recCount >= 1),
  badge('rec-10', '추천 요정', '추천을 참지 못한다', '책 추천 10개 작성', 'rare',
    (s) => s.recCount >= 10),

  // ── 커뮤니티 ────────────────────────────────────────────────────────
  badge('post-first', '첫 글', '피드에 말을 걸었다', '글 1개 작성', 'common',
    (s) => s.postCount >= 1),
  badge('post-20', '수다쟁이', '할 말이 많다', '글 20개 작성', 'rare',
    (s) => s.postCount >= 20),
  badge('comment-30', '댓글 요정', '읽으면 꼭 한 마디', '댓글 30개 작성', 'rare',
    (s) => s.commentCount >= 30),
  badge('club-join', '모임 입문', '사람들과 같이 읽는다', '독서 모임 1개 참여', 'common',
    (s) => s.clubCount >= 1),
  badge('club-3', '모임 러버', '혼자보다 여럿', '독서 모임 3개 참여', 'rare',
    (s) => s.clubCount >= 3),
  badge('follow-10', '취향 탐색가', '취향이 맞는 사람을 모은다', '10명 팔로우', 'common',
    (s) => s.followingCount >= 10),
  badge('follower-10', '인기 독서가', '내 취향을 따라오는 사람들', '팔로워 10명', 'rare',
    (s) => s.followerCount >= 10),
  badge('follower-50', '북작 셀럽', '서재가 유명해졌다', '팔로워 50명', 'legendary',
    (s) => s.followerCount >= 50),

  // ── 출석 ────────────────────────────────────────────────────────────
  badge('streak-7', '일주일 개근', '7일 연속 출석', '연속 출석 7일', 'common',
    (s) => s.attendanceStreak >= 7),
  badge('streak-30', '한 달 개근', '30일 연속 출석', '연속 출석 30일', 'legendary',
    (s) => s.attendanceStreak >= 30),
]

export function isBadgeUnlocked(badge: Badge, stats: BadgeStats): boolean {
  return badge.check ? badge.check(stats) : stats.answerBadges.includes(badge.key)
}

/** 획득한 것 먼저, 그 안에서 등급 높은 순 — 획득/미획득을 같이 보여주기 위한 정렬 */
const TIER_ORDER: Record<BadgeTier, number> = { legendary: 0, rare: 1, common: 2 }

export function evaluateBadges(stats: BadgeStats): { badge: Badge; unlocked: boolean }[] {
  return BADGE_LIST
    .map((badge) => ({ badge, unlocked: isBadgeUnlocked(badge, stats) }))
    .sort((a, b) =>
      Number(b.unlocked) - Number(a.unlocked) ||
      TIER_ORDER[a.badge.tier] - TIER_ORDER[b.badge.tier])
}
