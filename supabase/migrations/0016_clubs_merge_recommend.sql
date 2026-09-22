-- 모임 탭 재구성
--   1) 공식 이벤트 → 모임으로 통합: clubs.is_official / starts_at 추가, events·event_participants 이관 후 삭제
--   2) 모임 게시판 club_posts — 멤버만 읽기·쓰기 (RLS)
--   3) 책 추천: rec_requests(추천 요청) / recommendations(추천) / rec_reads(읽을게요·후기)
--
-- 0015(notifications.type에 'recommend','rec_review' 추가) 다음에 실행할 것.
-- 0015 없이 실행하면 추천·후기 insert가 알림 type 제약에 걸려 실패한다.
-- Supabase 대시보드 > SQL Editor에 붙여넣고 Run. 여러 번 실행해도 안전.

-- ────────────────────────────────────────────────────────────
-- 1. clubs ← events 통합
-- ────────────────────────────────────────────────────────────
alter table public.clubs add column if not exists is_official boolean not null default false;
alter table public.clubs add column if not exists starts_at timestamptz;   -- 모임 일시 (선택)
-- 주최자 없는 공식 모임(운영팀)을 위해 null 허용. 장소는 기존 region 컬럼을 쓴다.
alter table public.clubs alter column organizer_id drop not null;

-- 공식 여부·인원 카운트는 사용자가 못 건드린다 (공식 여부는 DB에서만 설정).
-- ponytail: 컬럼 단위 권한 — clubs에 사용자 입력 컬럼이 늘면 여기 grant에도 추가해야 한다.
revoke insert, update on public.clubs from anon, authenticated;
grant insert (name, description, tags, capacity, format, region, illust, organizer_id, starts_at)
  on public.clubs to authenticated;
grant update (name, description, tags, capacity, format, region, illust, starts_at)
  on public.clubs to authenticated;

do $$
begin
  if to_regclass('public.events') is null then return; end if;

  -- 이관 중 '모임 참여' 알림이 주최자에게 쏟아지지 않게 잠시 끈다 (인원 카운트 트리거는 그대로)
  alter table public.club_members disable trigger notify_club_join;

  insert into public.clubs
    (id, name, description, tags, capacity, member_count, format, region,
     organizer_id, is_official, starts_at, created_at)
  select e.id, e.title, e.description, e.tags,
         -- 정원 없는 이벤트는 100명. 기존 참가자 + 주최자가 0010 정원 트리거에 막히지 않게 보정
         greatest(coalesce(e.max_participants, 100),
                  (select count(*) from public.event_participants p where p.event_id = e.id) + 1),
         0,
         case when e.location_type = 'offline' then '오프라인' else '온라인' end,
         e.location, e.created_by, e.is_official, e.event_date, e.created_at
    from public.events e
  on conflict (id) do nothing;

  -- 주최자도 멤버 (createClub과 같은 규칙)
  insert into public.club_members (club_id, user_id)
  select e.id, e.created_by from public.events e where e.created_by is not null
  on conflict do nothing;

  insert into public.club_members (club_id, user_id, joined_at)
  select p.event_id, p.user_id, p.joined_at from public.event_participants p
  on conflict do nothing;

  alter table public.club_members enable trigger notify_club_join;
end;
$$;

drop table if exists public.event_participants;
drop table if exists public.events;

-- ────────────────────────────────────────────────────────────
-- 2. 모임 게시판 — 멤버만 읽고 쓴다
-- ────────────────────────────────────────────────────────────
create table if not exists public.club_posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 1 and 1000),
  created_at timestamptz not null default now()
);
create index if not exists club_posts_club_idx on public.club_posts (club_id, created_at desc);

create or replace function public.is_club_member(p_club uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.club_members where club_id = p_club and user_id = auth.uid());
$$;

alter table public.club_posts enable row level security;
drop policy if exists "club_posts: 멤버만 조회" on public.club_posts;
create policy "club_posts: 멤버만 조회" on public.club_posts
  for select to authenticated using (public.is_club_member(club_id));
drop policy if exists "club_posts: 멤버 본인만 등록" on public.club_posts;
create policy "club_posts: 멤버 본인만 등록" on public.club_posts
  for insert to authenticated with check (auth.uid() = author_id and public.is_club_member(club_id));
drop policy if exists "club_posts: 본인만 삭제" on public.club_posts;
create policy "club_posts: 본인만 삭제" on public.club_posts
  for delete to authenticated using (auth.uid() = author_id);

drop trigger if exists rate_limit_club_posts on public.club_posts;
create trigger rate_limit_club_posts before insert on public.club_posts
  for each row execute function public.tg_rate_limit();

-- ────────────────────────────────────────────────────────────
-- 3. 책 추천
-- ────────────────────────────────────────────────────────────
create table if not exists public.rec_requests (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  type_code text,                                   -- 작성 시점 BOOKBTI 스냅샷 (트리거가 채움)
  mood text not null check (char_length(btrim(mood)) between 2 and 100),
  book_title text,                                  -- 최근 좋았던 책 (선택)
  book_isbn text,
  book_cover text,
  is_open boolean not null default true,
  rec_count int not null default 0,                 -- 추천 수 (트리거)
  reader_count int not null default 0,              -- 이 요청의 추천들에 달린 '읽을게요' 수 (트리거)
  -- 인기 = 추천 수 + 읽을게요 × 2 — '읽어볼게'는 추천이 실제로 먹혔다는 더 강한 신호
  popularity int generated always as (rec_count + reader_count * 2) stored,
  created_at timestamptz not null default now()
);
create index if not exists rec_requests_created_idx on public.rec_requests (created_at desc);
create index if not exists rec_requests_popularity_idx on public.rec_requests (popularity desc, created_at desc);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.rec_requests (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  book_title text not null,
  book_isbn text,
  book_cover text,
  reason text not null check (char_length(btrim(reason)) between 2 and 300),
  created_at timestamptz not null default now()
);
create index if not exists recommendations_request_idx on public.recommendations (request_id, created_at);

create table if not exists public.rec_reads (
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  rating numeric(2, 1) check (rating between 0.5 and 5 and rating * 2 = floor(rating * 2)),
  review text check (char_length(btrim(review)) between 1 and 200),
  reviewed_at timestamptz,                          -- 트리거가 채움
  created_at timestamptz not null default now(),
  primary key (recommendation_id, user_id)
);

-- 권한: 카운터·스냅샷 컬럼은 트리거만 쓴다
revoke insert, update on public.rec_requests from anon, authenticated;
grant insert (author_id, mood, book_title, book_isbn, book_cover) on public.rec_requests to authenticated;
grant update (is_open) on public.rec_requests to authenticated;
revoke insert, update on public.recommendations from anon, authenticated;
grant insert (request_id, author_id, book_title, book_isbn, book_cover, reason) on public.recommendations to authenticated;
revoke insert, update on public.rec_reads from anon, authenticated;
grant insert (recommendation_id, user_id) on public.rec_reads to authenticated;
grant update (rating, review) on public.rec_reads to authenticated;

alter table public.rec_requests enable row level security;
drop policy if exists "rec_requests: 누구나 조회" on public.rec_requests;
create policy "rec_requests: 누구나 조회" on public.rec_requests for select using (true);
drop policy if exists "rec_requests: 본인만 등록" on public.rec_requests;
create policy "rec_requests: 본인만 등록" on public.rec_requests
  for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "rec_requests: 본인만 열고 닫기" on public.rec_requests;
create policy "rec_requests: 본인만 열고 닫기" on public.rec_requests
  for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);

alter table public.recommendations enable row level security;
drop policy if exists "recommendations: 누구나 조회" on public.recommendations;
create policy "recommendations: 누구나 조회" on public.recommendations for select using (true);
drop policy if exists "recommendations: 본인만 등록" on public.recommendations;
create policy "recommendations: 본인만 등록" on public.recommendations
  for insert to authenticated with check (auth.uid() = author_id);

alter table public.rec_reads enable row level security;
drop policy if exists "rec_reads: 누구나 조회" on public.rec_reads;
create policy "rec_reads: 누구나 조회" on public.rec_reads for select using (true);
drop policy if exists "rec_reads: 본인만 등록" on public.rec_reads;
create policy "rec_reads: 본인만 등록" on public.rec_reads
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "rec_reads: 본인만 후기" on public.rec_reads;
create policy "rec_reads: 본인만 후기" on public.rec_reads
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "rec_reads: 본인만 취소" on public.rec_reads;
create policy "rec_reads: 본인만 취소" on public.rec_reads
  for delete to authenticated using (auth.uid() = user_id);

-- 요청: BOOKBTI 스냅샷
create or replace function public.tg_rec_request_snapshot() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  select type_code into new.type_code from public.profiles where id = new.author_id;
  return new;
end;
$$;
drop trigger if exists rec_request_snapshot on public.rec_requests;
create trigger rec_request_snapshot before insert on public.rec_requests
  for each row execute function public.tg_rec_request_snapshot();

-- 추천: 본인 요청 불가 / 닫힌 요청 불가 / 요청당 1인 3권
-- 요청 행을 for update로 잠가 같은 요청에 대한 동시 추천을 직렬화한다 (3권 검사 경쟁 방지).
create or replace function public.tg_guard_recommendation() returns trigger
language plpgsql security definer set search_path = public as $$
declare req record;
begin
  select author_id, is_open into req from public.rec_requests where id = new.request_id for update;
  if not found then raise exception 'rec_not_found' using errcode = 'P0001'; end if;
  if req.author_id = new.author_id then raise exception 'rec_self' using errcode = 'P0001'; end if;
  if not req.is_open then raise exception 'rec_closed' using errcode = 'P0001'; end if;
  if (select count(*) from public.recommendations
       where request_id = new.request_id and author_id = new.author_id) >= 3 then
    raise exception 'rec_limit' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
drop trigger if exists guard_recommendation on public.recommendations;
create trigger guard_recommendation before insert on public.recommendations
  for each row execute function public.tg_guard_recommendation();

-- 추천 수 + 요청자 알림
create or replace function public.tg_after_recommendation() returns trigger
language plpgsql security definer set search_path = public as $$
declare owner_id uuid;
begin
  if tg_op = 'INSERT' then
    update public.rec_requests set rec_count = rec_count + 1
     where id = new.request_id returning author_id into owner_id;
    perform public.notify(owner_id, new.author_id, 'recommend', new.request_id::text, 'rec_request');
    return new;
  else
    update public.rec_requests set rec_count = greatest(0, rec_count - 1) where id = old.request_id;
    return old;
  end if;
end;
$$;
drop trigger if exists after_recommendation on public.recommendations;
create trigger after_recommendation after insert or delete on public.recommendations
  for each row execute function public.tg_after_recommendation();

-- 읽을게요 수 (요청 단위 — 인기순용)
create or replace function public.tg_sync_rec_reader_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.rec_requests q set reader_count = reader_count + 1
      from public.recommendations r where r.id = new.recommendation_id and q.id = r.request_id;
    return new;
  else
    update public.rec_requests q set reader_count = greatest(0, reader_count - 1)
      from public.recommendations r where r.id = old.recommendation_id and q.id = r.request_id;
    return old;
  end if;
end;
$$;
drop trigger if exists sync_rec_reader_count on public.rec_reads;
create trigger sync_rec_reader_count after insert or delete on public.rec_reads
  for each row execute function public.tg_sync_rec_reader_count();

-- 후기: 처음 남길 때 시각 기록 + 추천자 알림
create or replace function public.tg_rec_review() returns trigger
language plpgsql security definer set search_path = public as $$
declare rec record;
begin
  if new.review is not null and old.review is null then
    new.reviewed_at := now();
    select author_id, request_id into rec from public.recommendations where id = new.recommendation_id;
    perform public.notify(rec.author_id, new.user_id, 'rec_review', rec.request_id::text, 'rec_request');
  end if;
  return new;
end;
$$;
drop trigger if exists rec_review on public.rec_reads;
create trigger rec_review before update on public.rec_reads
  for each row execute function public.tg_rec_review();

drop trigger if exists rate_limit_rec_requests on public.rec_requests;
create trigger rate_limit_rec_requests before insert on public.rec_requests
  for each row execute function public.tg_rate_limit();
drop trigger if exists rate_limit_recommendations on public.recommendations;
create trigger rate_limit_recommendations before insert on public.recommendations
  for each row execute function public.tg_rate_limit();
