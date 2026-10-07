-- 집계 컬럼을 사용자가 직접 고치지 못하게 막는다.
--
-- 문제: RLS update 정책은 "누가 그 행을 고칠 수 있나"만 정하고 "어느 컬럼을"은 정하지 않는다.
--  - posts: 작성자가 REST로 `update posts set like_count = 9999`를 보내면 그대로 반영됐다.
--  - clubs: 주최자가 member_count를 낮춰 정원 마감을 우회할 수 있었다.
--  - rec_requests: 작성자가 rec_count·reader_count·saved_count(→ 인기순)를 조작할 수 있었다.
--  - books: 로그인한 누구나 남이 등록한 책의 제목·표지를 덮어쓸 수 있었다.
--
-- 방법: 집계 컬럼은 트리거만 고친다. 사용자의 직접 update(트리거 깊이 1)에서는 옛 값으로 되돌린다.
-- 집계 트리거 안에서 일어난 update는 깊이가 2 이상이라 그대로 통과한다.
-- 운영 중 카운트를 일괄 재계산해야 하면 같은 트랜잭션에서
--   alter table … disable trigger keep_counters; … enable trigger keep_counters;
-- 로 감싼다(0004의 재계산 쿼리 같은 경우).
-- 컬럼 권한(grant update (col…))으로 막는 방법도 있지만, 컬럼이 늘 때마다 목록을 고쳐야 해서 트리거로 둔다.

create or replace function public.tg_keep_counters() returns trigger
language plpgsql as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;
  if tg_table_name = 'posts' then
    new.like_count := old.like_count;
    new.comment_count := old.comment_count;
  elsif tg_table_name = 'clubs' then
    new.member_count := old.member_count;
  elsif tg_table_name = 'rec_requests' then
    new.rec_count := old.rec_count;
    new.reader_count := old.reader_count;
    new.saved_count := old.saved_count;
  end if;
  return new;
end;
$$;

drop trigger if exists keep_counters on public.posts;
create trigger keep_counters before update on public.posts
  for each row execute function public.tg_keep_counters();
drop trigger if exists keep_counters on public.clubs;
create trigger keep_counters before update on public.clubs
  for each row execute function public.tg_keep_counters();
drop trigger if exists keep_counters on public.rec_requests;
create trigger keep_counters before update on public.rec_requests
  for each row execute function public.tg_keep_counters();

-- books: 등록(insert)만 허용한다. 앱은 이미 있는 책이면 아무것도 안 한다(upsert ignoreDuplicates).
drop policy if exists "books: 로그인 사용자 수정" on public.books;

-- _migrations(scripts/migrate.mjs 기록용)가 public 스키마에 RLS 없이 있어 anon 키로 읽고 쓸 수 있었다.
-- 정책 없이 RLS만 켜면 API로는 닫히고, DB 직접 접속(마이그레이션 스크립트)만 쓸 수 있다.
alter table if exists public._migrations enable row level security;
