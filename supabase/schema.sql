-- 북작 — 평가·리뷰 공유 스키마
-- Supabase 대시보드 > SQL Editor에 전체 붙여넣고 Run 하면 끝.
-- 사전 조건: Authentication > Sign In / Providers 에서 "Anonymous sign-ins" 활성화

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
