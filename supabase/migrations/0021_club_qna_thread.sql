-- 모임 궁금한 점 → 질문/답글 2단 + 모임 수정
--   1) club_posts.parent_id — null이면 질문, 값이 있으면 그 질문의 답글. 2단까지만.
--   2) clubs.capacity를 현재 인원보다 작게 줄이지 못하게 (0010 트리거와 같은 부등식)
--   3) 누락된 테이블 권한 보강 — club_posts에 anon/authenticated 권한이 아예 없어
--      QnA 읽기·쓰기가 전부 권한 에러였다. clubs도 select가 빠져 있었다.
--
-- 0020 다음에 실행할 것. 여러 번 실행해도 안전.

-- ────────────────────────────────────────────────────────────
-- 1. 질문 / 답글
-- ────────────────────────────────────────────────────────────
alter table public.club_posts
  add column if not exists parent_id uuid references public.club_posts (id) on delete cascade;

create index if not exists club_posts_parent_idx on public.club_posts (parent_id, created_at);

-- 답글의 답글 금지 + 답글은 질문과 같은 모임에만.
-- RLS는 "누가 쓰는가"만 보므로 트리 모양은 여기서 지킨다.
create or replace function public.tg_guard_club_post_parent() returns trigger
language plpgsql security definer set search_path = public as $$
declare p record;
begin
  if new.parent_id is null then return new; end if;
  select club_id, parent_id into p from public.club_posts where id = new.parent_id;
  if not found then raise exception 'post_parent_missing' using errcode = 'P0001'; end if;
  if p.parent_id is not null then raise exception 'post_depth' using errcode = 'P0001'; end if;
  if p.club_id <> new.club_id then raise exception 'post_club_mismatch' using errcode = 'P0001'; end if;
  return new;
end;
$$;

drop trigger if exists guard_club_post_parent on public.club_posts;
create trigger guard_club_post_parent before insert or update of parent_id on public.club_posts
  for each row execute function public.tg_guard_club_post_parent();

-- ────────────────────────────────────────────────────────────
-- 2. 정원은 현재 인원 밑으로 못 내려간다
--    (0010 트리거가 member_count < capacity일 때만 증가시키므로 부등식이 일치한다)
-- ────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clubs_capacity_gte_members') then
    alter table public.clubs
      add constraint clubs_capacity_gte_members check (capacity >= member_count) not valid;
  end if;
end;
$$;

-- ────────────────────────────────────────────────────────────
-- 3. 권한 보강
-- ────────────────────────────────────────────────────────────
-- 모임 목록·상세 읽기는 비로그인도 가능해야 한다 (RLS "clubs: 누구나 조회"가 행을 거른다)
grant select on public.clubs to anon, authenticated;

-- club_posts: 읽기는 누구나, 쓰기·삭제는 로그인. 행 조건은 0018 RLS가 본다.
-- 카운터·스냅샷 컬럼이 없는 테이블이라 컬럼 단위로 쪼개지 않는다.
grant select on public.club_posts to anon, authenticated;
grant insert, delete on public.club_posts to authenticated;
