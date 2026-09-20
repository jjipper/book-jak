// 다른 사용자 프로필 조회 (Supabase profiles + follows 집계 뷰)

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import { cachePerson, type Person } from '@/entities/person/model/people'

interface ProfileRow {
  id: string
  nickname: string
  type_code: string | null
  bio: string | null
  favorite_tags: string[] | null
}

function mapPerson(
  row: ProfileRow,
  counts?: { follower_count: number; following_count: number },
): Person {
  cachePerson(row.id, row.nickname, row.type_code)
  return {
    id: row.id,
    nickname: row.nickname,
    typeCode: (row.type_code as Person['typeCode']) ?? null,
    bio: row.bio ?? '',
    favoriteTags: row.favorite_tags ?? [],
    followerCount: counts?.follower_count ?? 0,
    followingCount: counts?.following_count ?? 0,
  }
}

const SELECT = 'id, nickname, type_code, bio, favorite_tags'

/** 나를 제외한 사용자 목록. 가입자가 나뿐이면 빈 배열 → 화면은 빈 상태를 띄운다. */
export async function loadPeople(limit = 50): Promise<Person[]> {
  const sb = createSupabaseBrowser()
  const { data: { user } } = await sb.auth.getUser()
  let query = sb.from('profiles').select(SELECT).limit(limit)
  if (user) query = query.neq('id', user.id)
  const { data } = await query
  return (data ?? []).map((row) => mapPerson(row as ProfileRow))
}

export async function loadPeopleByIds(ids: string[]): Promise<Person[]> {
  if (ids.length === 0) return []
  const sb = createSupabaseBrowser()
  const { data } = await sb.from('profiles').select(SELECT).in('id', ids)
  return (data ?? []).map((row) => mapPerson(row as ProfileRow))
}

export async function loadPerson(id: string): Promise<Person | null> {
  const sb = createSupabaseBrowser()
  const [{ data }, { data: counts }] = await Promise.all([
    sb.from('profiles').select(SELECT).eq('id', id).maybeSingle(),
    sb.from('profile_follow_counts').select('follower_count, following_count').eq('user_id', id).maybeSingle(),
  ])
  if (!data) return null
  return mapPerson(data as ProfileRow, (counts as { follower_count: number; following_count: number } | null) ?? undefined)
}

export interface RankingEntry {
  userId: string
  nickname: string
  typeCode: string | null
  score: number
  ratingsCount: number
  reviewsCount: number
  questionsCount: number
  answersCount: number
  clubsCreated: number
  clubsJoined: number
  postsCount: number
}

/** 활동 랭킹 — 점수 집계는 Postgres 뷰(reading_ranking)에서 한다. */
export async function loadRanking(limit = 50): Promise<RankingEntry[]> {
  const sb = createSupabaseBrowser()
  const { data } = await sb
    .from('reading_ranking')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit)
  return (data ?? []).map((r: Record<string, unknown>) => ({
    userId: r.user_id as string,
    nickname: r.nickname as string,
    typeCode: (r.type_code as string | null) ?? null,
    score: (r.score as number) ?? 0,
    ratingsCount: (r.ratings_count as number) ?? 0,
    reviewsCount: (r.reviews_count as number) ?? 0,
    questionsCount: (r.questions_count as number) ?? 0,
    answersCount: (r.answers_count as number) ?? 0,
    clubsCreated: (r.clubs_created as number) ?? 0,
    clubsJoined: (r.clubs_joined as number) ?? 0,
    postsCount: (r.posts_count as number) ?? 0,
  }))
}
