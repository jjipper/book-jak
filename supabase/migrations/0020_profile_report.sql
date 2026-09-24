-- 취향 리포트 — 인생책 3권.
--
-- 인생책은 별점과 무관하게 사용자가 직접 고른다(평가한 책 목록에서).
-- 순서를 유지해야 해서 position(1~3)을 PK에 넣는다 → 자연스럽게 "최대 3권"도 강제된다.
-- 책 메타는 스냅샷으로 들고 있는다: books 행이 없는 로컬 평가도 고를 수 있어야 하고,
-- 다른 사람 프로필에서 보여줄 때 조인을 한 번 덜 한다.
--
-- "같이 높게 준 책"은 ratings의 select 정책이 이미 `using (true)`라 클라이언트에서
-- 바로 교집합을 낼 수 있다 → security definer 함수를 따로 두지 않는다.
--
-- 여러 번 실행해도 안전.

create table if not exists public.favorite_books (
  user_id    uuid     not null references auth.users (id) on delete cascade,
  position   smallint not null check (position between 1 and 3),
  book_id    text     not null,
  title      text     not null,
  thumbnail  text,
  created_at timestamptz not null default now(),
  primary key (user_id, position)
);

-- 같은 책을 두 칸에 넣지 못하게
create unique index if not exists favorite_books_user_book_uniq
  on public.favorite_books (user_id, book_id);

alter table public.favorite_books enable row level security;

-- 다른 사람 프로필에서도 보여주므로 조회는 공개
drop policy if exists "favorite_books: 누구나 조회" on public.favorite_books;
create policy "favorite_books: 누구나 조회" on public.favorite_books
  for select using (true);

drop policy if exists "favorite_books: 본인만 등록" on public.favorite_books;
create policy "favorite_books: 본인만 등록" on public.favorite_books
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "favorite_books: 본인만 수정" on public.favorite_books;
create policy "favorite_books: 본인만 수정" on public.favorite_books
  for update to authenticated using (auth.uid() = user_id);

drop policy if exists "favorite_books: 본인만 삭제" on public.favorite_books;
create policy "favorite_books: 본인만 삭제" on public.favorite_books
  for delete to authenticated using (auth.uid() = user_id);

-- 탈퇴(익명화)는 계정 행을 지우지 않으므로 cascade가 안 걸린다 — 여기서 같이 지운다.
-- 0006 withdraw_my_account가 profiles.withdrawn_at을 세우는 것에 맞춰 트리거로.
create or replace function public.tg_purge_favorite_books_on_withdraw() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.withdrawn_at is not null and old.withdrawn_at is null then
    delete from public.favorite_books where user_id = new.id;
  end if;
  return new;
end $$;

drop trigger if exists purge_favorite_books_on_withdraw on public.profiles;
create trigger purge_favorite_books_on_withdraw
  after update of withdrawn_at on public.profiles
  for each row execute function public.tg_purge_favorite_books_on_withdraw();
