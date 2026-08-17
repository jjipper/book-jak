-- 북작 — 스키마
-- Supabase 대시보드 > SQL Editor에 전체 붙여넣고 Run 하면 끝.
-- 사전 조건: Authentication > Providers 에서 Kakao OAuth 설정

-- 사용자 프로필 (카카오 OAuth 로그인 후 최초 닉네임 설정 시 생성)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null,
  avatar_url text,             -- base64 dataUrl (작은 앱 기준, 추후 Storage 이관 가능)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: 누구나 조회" on public.profiles
  for select using (true);
create policy "profiles: 본인 등록·수정" on public.profiles
  for insert to authenticated with check (auth.uid() = id);
create policy "profiles: 본인 수정" on public.profiles
  for update to authenticated using (auth.uid() = id);

-- 책 (평가가 달리는 순간 upsert되는 메타데이터 스냅샷)
create table public.books (
  id text primary key, -- 카탈로그 책 'b01', 카카오 검색 책 'isbn-{ISBN13}'
  title text not null,
  authors text[] not null default '{}',
  publisher text,
  year int,
  thumbnail text,
  created_at timestamptz not null default now()
);

-- 평가 (사용자당 책 하나에 한 건, 다시 평가하면 갱신)
create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null references public.books (id) on delete cascade,
  nickname text, -- 표시용 스냅샷 (프로필 테이블 없이 리뷰에 닉네임 노출)
  stars smallint not null check (stars between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

create index ratings_book_id_idx on public.ratings (book_id);

-- RLS: 누구나 읽기, 쓰기는 본인 것만
alter table public.books enable row level security;
alter table public.ratings enable row level security;

create policy "books: 누구나 조회" on public.books
  for select using (true);
create policy "books: 로그인 사용자 등록" on public.books
  for insert to authenticated with check (true);

create policy "ratings: 누구나 조회" on public.ratings
  for select using (true);
create policy "ratings: 본인 등록" on public.ratings
  for insert to authenticated with check (auth.uid() = user_id);
create policy "ratings: 본인 수정" on public.ratings
  for update to authenticated using (auth.uid() = user_id);
create policy "ratings: 본인 삭제" on public.ratings
  for delete to authenticated using (auth.uid() = user_id);

-- profiles 확장: 독서유형, 자기소개, 선호태그, 활동점수
alter table public.profiles add column if not exists type_code text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists favorite_tags text[] default '{}';
alter table public.profiles add column if not exists activity_score int not null default 0;

-- 팔로우 관계
create table if not exists public.follows (
  follower_id uuid not null references auth.users (id) on delete cascade,
  followee_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);
alter table public.follows enable row level security;
create policy "follows: 누구나 조회" on public.follows for select using (true);
create policy "follows: 본인만 등록" on public.follows for insert to authenticated with check (auth.uid() = follower_id);
create policy "follows: 본인만 삭제" on public.follows for delete to authenticated using (auth.uid() = follower_id);

-- 좋아요 (토론 글 대상)
create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_id text not null,
  target_type text not null default 'question',
  created_at timestamptz not null default now(),
  unique (user_id, target_id, target_type)
);
alter table public.likes enable row level security;
create policy "likes: 누구나 조회" on public.likes for select using (true);
create policy "likes: 본인만 등록" on public.likes for insert to authenticated with check (auth.uid() = user_id);
create policy "likes: 본인만 삭제" on public.likes for delete to authenticated using (auth.uid() = user_id);

-- 토론 질문
create table if not exists public.discussion_questions (
  id uuid primary key default gen_random_uuid(),
  book_id int,
  author_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  like_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.discussion_questions enable row level security;
create policy "discussion_questions: 누구나 조회" on public.discussion_questions for select using (true);
create policy "discussion_questions: 본인만 등록" on public.discussion_questions for insert to authenticated with check (auth.uid() = author_id);
create policy "discussion_questions: 본인만 삭제" on public.discussion_questions for delete to authenticated using (auth.uid() = author_id);

-- 토론 답변
create table if not exists public.discussion_answers (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.discussion_questions (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.discussion_answers enable row level security;
create policy "discussion_answers: 누구나 조회" on public.discussion_answers for select using (true);
create policy "discussion_answers: 본인만 등록" on public.discussion_answers for insert to authenticated with check (auth.uid() = author_id);
create policy "discussion_answers: 본인만 삭제" on public.discussion_answers for delete to authenticated using (auth.uid() = author_id);

-- 책 모임
create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  tags text[] not null default '{}',
  capacity int not null default 6,
  member_count int not null default 1,
  format text not null default '온라인',
  region text,
  organizer_id uuid not null references auth.users (id) on delete cascade,
  illust text,
  created_at timestamptz not null default now()
);
alter table public.clubs enable row level security;
create policy "clubs: 누구나 조회" on public.clubs for select using (true);
create policy "clubs: 본인만 등록" on public.clubs for insert to authenticated with check (auth.uid() = organizer_id);
create policy "clubs: 주최자만 수정" on public.clubs for update to authenticated using (auth.uid() = organizer_id);
create policy "clubs: 주최자만 삭제" on public.clubs for delete to authenticated using (auth.uid() = organizer_id);

-- 모임 멤버
create table if not exists public.club_members (
  club_id uuid not null references public.clubs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);
alter table public.club_members enable row level security;
create policy "club_members: 누구나 조회" on public.club_members for select using (true);
create policy "club_members: 본인만 등록" on public.club_members for insert to authenticated with check (auth.uid() = user_id);
create policy "club_members: 본인만 삭제" on public.club_members for delete to authenticated using (auth.uid() = user_id);

-- 피드 포스트 (홈 소셜 피드)
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  book_title text,
  like_count int not null default 0,
  comment_count int not null default 0,
  created_at timestamptz not null default now()
);
alter table public.posts enable row level security;
create policy "posts: 누구나 조회" on public.posts for select using (true);
create policy "posts: 본인만 등록" on public.posts for insert to authenticated with check (auth.uid() = author_id);
create policy "posts: 본인만 삭제" on public.posts for delete to authenticated using (auth.uid() = author_id);

-- 포스트 좋아요 카운트 증감 RPC (likes 테이블과 연동)
create or replace function public.increment_post_like(post_id uuid)
returns void language sql security definer as $$
  update public.posts set like_count = like_count + 1 where id = post_id;
$$;

create or replace function public.decrement_post_like(post_id uuid)
returns void language sql security definer as $$
  update public.posts set like_count = greatest(0, like_count - 1) where id = post_id;
$$;

-- 블라인드 책 반응 (발견 탭 성향 수집)
create table if not exists public.blind_reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  blind_book_id int not null,
  action text not null check (action in ('save', 'pass')),
  created_at timestamptz not null default now(),
  unique (user_id, blind_book_id)
);
alter table public.blind_reactions enable row level security;
create policy "blind_reactions: 본인만 조회" on public.blind_reactions for select using (auth.uid() = user_id);
create policy "blind_reactions: 본인만 등록" on public.blind_reactions for insert to authenticated with check (auth.uid() = user_id);
create policy "blind_reactions: 본인만 수정" on public.blind_reactions for update to authenticated using (auth.uid() = user_id);
