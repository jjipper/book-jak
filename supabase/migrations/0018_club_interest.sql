-- 모임 화면 개편
--   1) 모임 게시판(club_posts) → QnA: 참여를 고민하는 사람도 질문·답변을 봐야 하므로
--      읽기는 누구나(비로그인 포함), 쓰기는 로그인으로 바꾼다. 테이블은 그대로 쓴다.
--   2) 관심 모임(club_interests) — 본인만 읽고 쓴다.
--
-- 0016 다음에 실행할 것. 여러 번 실행해도 안전.

-- ────────────────────────────────────────────────────────────
-- 1. club_posts — 게시판(멤버 전용) → QnA(공개 열람)
-- ────────────────────────────────────────────────────────────
drop policy if exists "club_posts: 멤버만 조회" on public.club_posts;
create policy "club_posts: 누구나 조회" on public.club_posts
  for select using (true);

drop policy if exists "club_posts: 멤버 본인만 등록" on public.club_posts;
create policy "club_posts: 로그인 본인만 등록" on public.club_posts
  for insert to authenticated with check (auth.uid() = author_id);

-- 멤버 여부 검사는 이제 어느 정책에서도 쓰지 않는다
drop function if exists public.is_club_member(uuid);

-- ────────────────────────────────────────────────────────────
-- 2. 관심 모임 — 담아뒀다 나중에 보기
-- ────────────────────────────────────────────────────────────
create table if not exists public.club_interests (
  user_id uuid not null references public.profiles (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, club_id)
);
create index if not exists club_interests_user_idx on public.club_interests (user_id, created_at desc);

alter table public.club_interests enable row level security;

drop policy if exists "club_interests: 본인 조회" on public.club_interests;
create policy "club_interests: 본인 조회" on public.club_interests
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "club_interests: 본인 등록" on public.club_interests;
create policy "club_interests: 본인 등록" on public.club_interests
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "club_interests: 본인 삭제" on public.club_interests;
create policy "club_interests: 본인 삭제" on public.club_interests
  for delete to authenticated using (auth.uid() = user_id);

-- 탈퇴(0006 익명화) 시 관심 목록도 파기 — 찜(0009)과 같은 규칙
create or replace function public.tg_purge_club_interests_on_withdraw() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.club_interests where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists purge_club_interests_on_withdraw on public.profiles;
create trigger purge_club_interests_on_withdraw
  after update of withdrawn_at on public.profiles
  for each row
  when (old.withdrawn_at is null and new.withdrawn_at is not null)
  execute function public.tg_purge_club_interests_on_withdraw();
