-- 평가 별점 유실 수정 + 찜(읽고싶어요) 서버 저장
--
-- 앱 배포 전에 실행할 것. 새 코드는 ratings.category_name과 wishlist 테이블을 읽고 쓴다
-- (실행 전에 배포하면 별점 저장이 category_name 컬럼 없음 에러로 실패한다).
-- 0002 이후 어느 시점이든 실행 가능하고, 여러 번 실행해도 안전하다.

-- 1) 평가에 알라딘 장르를 함께 저장 — 기기가 바뀌어도 마이의 장르 분석이 유지되도록
alter table public.ratings add column if not exists category_name text;

-- 2) 반 개 별점(0.5 단위) 허용 — smallint라 3.5점 같은 값은 서버 저장이 실패하고 있었다
alter table public.ratings drop constraint if exists ratings_stars_check;
alter table public.ratings alter column stars type numeric(2, 1);
alter table public.ratings add constraint ratings_stars_check
  check (stars between 0.5 and 5 and stars * 2 = floor(stars * 2));

-- 3) 찜 — 본인만 읽고 쓴다
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  book_id text not null, -- 'isbn-…' / 'blind-{id}' (블라인드 책은 books 행이 없어 FK를 걸지 않는다)
  title text not null,
  author text,
  publisher text,
  cover text,        -- 표지 URL
  illust_code text,  -- 블라인드 책 일러스트 코드
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

alter table public.wishlist enable row level security;

drop policy if exists "wishlist: 본인 조회" on public.wishlist;
create policy "wishlist: 본인 조회" on public.wishlist
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "wishlist: 본인 등록" on public.wishlist;
create policy "wishlist: 본인 등록" on public.wishlist
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "wishlist: 본인 삭제" on public.wishlist;
create policy "wishlist: 본인 삭제" on public.wishlist
  for delete to authenticated using (auth.uid() = user_id);

-- 탈퇴(0006 익명화) 시 찜 목록도 파기한다.
-- 0006의 함수를 다시 쓰지 않고, withdrawn_at이 처음 찍히는 순간에 지운다.
create or replace function public.tg_purge_wishlist_on_withdraw() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  delete from public.wishlist where user_id = new.id;
  return new;
end;
$$;

drop trigger if exists purge_wishlist_on_withdraw on public.profiles;
create trigger purge_wishlist_on_withdraw
  after update of withdrawn_at on public.profiles
  for each row
  when (old.withdrawn_at is null and new.withdrawn_at is not null)
  execute function public.tg_purge_wishlist_on_withdraw();
