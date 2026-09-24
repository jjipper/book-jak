-- 책 추천을 두 종류로 가른다 (0016 위에 올린다)
--   ask   — "추천 받고 싶어요": 다른 사람들이 책을 채운다 (기존 동작, 기존 행은 전부 ask)
--   share — "내가 추천해요"  : 작성자 본인만 책을 담는다
-- 그리고 '서재에 담은 수' 집계용 rec_saves 추가.
-- 여러 번 실행해도 안전.

-- ────────────────────────────────────────────────────────────
-- 1. kind
-- ────────────────────────────────────────────────────────────
alter table public.rec_requests add column if not exists kind text not null default 'ask';
alter table public.rec_requests drop constraint if exists rec_requests_kind_check;
alter table public.rec_requests add constraint rec_requests_kind_check check (kind in ('ask', 'share'));

-- "최근 좋았던 책"(요청자가 고르던 참고 책) 폐기
alter table public.rec_requests drop column if exists book_title;
alter table public.rec_requests drop column if exists book_isbn;
alter table public.rec_requests drop column if exists book_cover;

-- ────────────────────────────────────────────────────────────
-- 2. 서재에 담은 수 — wishlist는 본인만 조회하는 RLS라 집계에 못 쓴다.
--    rec_reads(읽을게요)와 같은 모양의 전용 테이블을 둔다.
-- ────────────────────────────────────────────────────────────
alter table public.rec_requests add column if not exists saved_count int not null default 0;

create table if not exists public.rec_saves (
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recommendation_id, user_id)
);

revoke insert, update on public.rec_saves from anon, authenticated;
grant insert (recommendation_id, user_id) on public.rec_saves to authenticated;

alter table public.rec_saves enable row level security;
drop policy if exists "rec_saves: 누구나 조회" on public.rec_saves;
create policy "rec_saves: 누구나 조회" on public.rec_saves for select using (true);
drop policy if exists "rec_saves: 본인만 등록" on public.rec_saves;
create policy "rec_saves: 본인만 등록" on public.rec_saves
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "rec_saves: 본인만 취소" on public.rec_saves;
create policy "rec_saves: 본인만 취소" on public.rec_saves
  for delete to authenticated using (auth.uid() = user_id);

create or replace function public.tg_sync_rec_saved_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.rec_requests q set saved_count = saved_count + 1
      from public.recommendations r where r.id = new.recommendation_id and q.id = r.request_id;
    return new;
  else
    update public.rec_requests q set saved_count = greatest(0, saved_count - 1)
      from public.recommendations r where r.id = old.recommendation_id and q.id = r.request_id;
    return old;
  end if;
end;
$$;
drop trigger if exists sync_rec_saved_count on public.rec_saves;
create trigger sync_rec_saved_count after insert or delete on public.rec_saves
  for each row execute function public.tg_sync_rec_saved_count();

-- ────────────────────────────────────────────────────────────
-- 3. 권한 — kind는 등록 때만 정한다 (나중에 바꾸면 이미 담긴 책들이 규칙과 어긋난다)
-- ────────────────────────────────────────────────────────────
revoke insert, update on public.rec_requests from anon, authenticated;
grant insert (author_id, title, mood, kind) on public.rec_requests to authenticated;
grant update (is_open) on public.rec_requests to authenticated;

-- ────────────────────────────────────────────────────────────
-- 4. 추천 추가 규칙 — kind로 갈린다. 닫힘·1인 10권은 둘 다 유지.
-- ────────────────────────────────────────────────────────────
create or replace function public.tg_guard_recommendation() returns trigger
language plpgsql security definer set search_path = public as $$
declare req record;
begin
  select author_id, is_open, kind into req from public.rec_requests where id = new.request_id for update;
  if not found then raise exception 'rec_not_found' using errcode = 'P0001'; end if;
  if req.kind = 'share' then
    -- 내가 추천해요: 작성자만 채운다
    if req.author_id <> new.author_id then raise exception 'rec_share_only' using errcode = 'P0001'; end if;
  else
    -- 추천 받고 싶어요: 작성자는 못 채운다
    if req.author_id = new.author_id then raise exception 'rec_self' using errcode = 'P0001'; end if;
  end if;
  if not req.is_open then raise exception 'rec_closed' using errcode = 'P0001'; end if;
  if (select count(*) from public.recommendations
       where request_id = new.request_id and author_id = new.author_id) >= 10 then
    raise exception 'rec_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
