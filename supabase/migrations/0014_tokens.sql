-- 토큰 — 활동으로 모으고 블라인드 북 공개에 쓴다.
--
-- 규칙 (하루 기준은 KST)
--  - 가입 환영 +3 (1회, 기존 가입자도 이 파일 실행 시 1회 백필)
--  - 출석 +1/일        : 앱 진입 시 claim_attendance() RPC
--  - 글 1개 이상 +1/일  : posts insert 트리거
--  - 댓글 2개 이상 +1/일: comments insert 트리거
--  - 블라인드 북 공개 -1 : reveal_blind(isbn13) RPC. 이미 공개한 책은 무료
--
-- 잔액은 원장(token_ledger) 합계. 클라이언트는 원장을 읽기만 하고, 쓰기는 아래 함수·트리거만 한다
-- (insert/update/delete 정책이 없어 RLS가 막는다).
-- 공개 기록은 원장의 reason = 'reveal' 행(ref_id = isbn13)이 겸한다.
--
-- 선행: schema.sql(profiles·posts·blind_reactions), 0003(comments), 0006(profiles.withdrawn_at). 여러 번 실행해도 안전.

create table if not exists public.token_ledger (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount int not null,
  reason text not null check (reason in ('welcome', 'attendance', 'daily_post', 'daily_comment', 'reveal')),
  ref_date date,  -- 일일 지급의 KST 날짜
  ref_id text,    -- 글/댓글 id, 공개한 책 isbn13
  created_at timestamptz not null default now()
);
create index if not exists token_ledger_user_idx on public.token_ledger (user_id);

-- 중복 지급·차감 방지 — 글을 지우고 다시 써도 같은 날 두 번 받지 못한다
create unique index if not exists token_ledger_daily_uniq
  on public.token_ledger (user_id, reason, ref_date)
  where reason in ('attendance', 'daily_post', 'daily_comment');
create unique index if not exists token_ledger_welcome_uniq
  on public.token_ledger (user_id) where reason = 'welcome';
create unique index if not exists token_ledger_reveal_uniq
  on public.token_ledger (user_id, ref_id) where reason = 'reveal';

alter table public.token_ledger enable row level security;
drop policy if exists "token_ledger: 본인만 조회" on public.token_ledger;
create policy "token_ledger: 본인만 조회" on public.token_ledger
  for select to authenticated using (auth.uid() = user_id);

create or replace function public.kst_today() returns date
language sql stable as $$ select (now() at time zone 'Asia/Seoul')::date $$;

-- 잔액
create or replace function public.my_token_balance() returns int
language sql stable security invoker set search_path = public as $$
  select coalesce(sum(amount), 0)::int from public.token_ledger where user_id = auth.uid()
$$;

-- 출석 — 새로 받았으면 true
create or replace function public.claim_attendance() returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if auth.uid() is null then return false; end if;
  insert into public.token_ledger (user_id, amount, reason, ref_date)
  values (auth.uid(), 1, 'attendance', public.kst_today())
  on conflict do nothing;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

-- 블라인드 북 공개 — 잔액 확인과 차감을 사용자별 잠금 안에서 한 번에. 남은 잔액을 돌려준다.
-- 동시 요청이 와도 잠금이 직렬화하므로 잔액이 음수가 되지 않는다.
create or replace function public.reveal_blind(p_isbn text) returns int
language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  bal int;
begin
  if uid is null then raise exception 'LOGIN_REQUIRED'; end if;
  if p_isbn !~ '^\d{13}$' then raise exception 'INVALID_ISBN'; end if;

  perform pg_advisory_xact_lock(hashtext('token:' || uid::text));
  select coalesce(sum(amount), 0) into bal from public.token_ledger where user_id = uid;

  if exists (select 1 from public.token_ledger where user_id = uid and reason = 'reveal' and ref_id = p_isbn) then
    return bal; -- 이미 공개한 책은 무료
  end if;
  if bal < 1 then raise exception 'NO_TOKEN'; end if;

  insert into public.token_ledger (user_id, amount, reason, ref_date, ref_id)
  values (uid, -1, 'reveal', public.kst_today(), p_isbn);
  return bal - 1;
end;
$$;

revoke all on function public.my_token_balance() from public, anon;
revoke all on function public.claim_attendance() from public, anon;
revoke all on function public.reveal_blind(text) from public, anon;
grant execute on function public.my_token_balance() to authenticated;
grant execute on function public.claim_attendance() to authenticated;
grant execute on function public.reveal_blind(text) to authenticated;

-- 글 1개 이상 → +1/일
create or replace function public.tg_token_daily_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.token_ledger (user_id, amount, reason, ref_date, ref_id)
  values (new.author_id, 1, 'daily_post', public.kst_today(), new.id::text)
  on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists token_daily_post on public.posts;
create trigger token_daily_post after insert on public.posts
  for each row execute function public.tg_token_daily_post();

-- 댓글 2개 이상 → +1/일 (오늘 남아 있는 내 댓글 수 기준. 지급은 하루 한 번 — unique가 막는다)
create or replace function public.tg_token_daily_comment() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.comments
       where author_id = new.author_id
         and created_at >= (public.kst_today()::timestamp at time zone 'Asia/Seoul')) >= 2 then
    insert into public.token_ledger (user_id, amount, reason, ref_date, ref_id)
    values (new.author_id, 1, 'daily_comment', public.kst_today(), new.id::text)
    on conflict do nothing;
  end if;
  return new;
end;
$$;
drop trigger if exists token_daily_comment on public.comments;
create trigger token_daily_comment after insert on public.comments
  for each row execute function public.tg_token_daily_comment();

-- 가입 환영 +3
create or replace function public.tg_token_welcome() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.token_ledger (user_id, amount, reason)
  values (new.id, 3, 'welcome')
  on conflict do nothing;
  return new;
end;
$$;
drop trigger if exists token_welcome on public.profiles;
create trigger token_welcome after insert on public.profiles
  for each row execute function public.tg_token_welcome();

-- 기존 가입자 백필 (탈퇴자 제외)
insert into public.token_ledger (user_id, amount, reason)
select id, 3, 'welcome' from public.profiles where withdrawn_at is null
on conflict do nothing;

-- 블라인드 북 반응: 알라딘 isbn13(13자리)을 담도록 int → bigint.
-- 넘어가기('pass')·서재 담기('save') 진행도를 isbn13 기준으로 저장한다.
alter table public.blind_reactions alter column blind_book_id type bigint;
