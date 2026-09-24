-- 트랙 C — 알림 / 댓글 / 신고·차단 / 탈퇴 / 최소 스팸 방어
-- Supabase 대시보드 > SQL Editor에 붙여넣고 Run.

-- ────────────────────────────────────────────────────────────
-- 1. 알림
-- ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,   -- 수신자
  actor_id uuid references auth.users (id) on delete cascade,           -- 발신자
  type text not null check (type in ('follow', 'like', 'comment', 'answer', 'club')),
  target_id text,                                                        -- 대상 리소스 id
  target_type text,                                                      -- 'post' | 'question' | 'user' | 'club'
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notifications: 본인만 조회" on public.notifications;
create policy "notifications: 본인만 조회" on public.notifications
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "notifications: 본인만 수정" on public.notifications;
create policy "notifications: 본인만 수정" on public.notifications
  for update to authenticated using (auth.uid() = user_id);
drop policy if exists "notifications: 본인만 삭제" on public.notifications;
create policy "notifications: 본인만 삭제" on public.notifications
  for delete to authenticated using (auth.uid() = user_id);
-- insert 정책 없음: 생성은 아래 security definer 트리거만 한다.

-- 공통 삽입 헬퍼 (수신자 == 발신자면 알림 만들지 않음)
create or replace function public.notify(
  p_user uuid, p_actor uuid, p_type text, p_target text, p_target_type text
) returns void language plpgsql security definer as $$
begin
  if p_user is null or p_user = p_actor then return; end if;
  insert into public.notifications (user_id, actor_id, type, target_id, target_type)
  values (p_user, p_actor, p_type, p_target, p_target_type);
end;
$$;

create or replace function public.tg_notify_follow() returns trigger
language plpgsql security definer as $$
begin
  perform public.notify(new.followee_id, new.follower_id, 'follow', new.follower_id::text, 'user');
  return new;
end;
$$;
drop trigger if exists notify_follow on public.follows;
create trigger notify_follow after insert on public.follows
  for each row execute function public.tg_notify_follow();

-- 좋아요: target_type에 따라 주인을 찾는다 (post / question)
create or replace function public.tg_notify_like() returns trigger
language plpgsql security definer as $$
declare owner_id uuid;
begin
  if new.target_type = 'post' then
    select author_id into owner_id from public.posts where id::text = new.target_id;
  else
    select author_id into owner_id from public.discussion_questions where id::text = new.target_id;
  end if;
  perform public.notify(
    owner_id, new.user_id, 'like', new.target_id,
    case when new.target_type = 'post' then 'post' else 'question' end
  );
  return new;
end;
$$;
drop trigger if exists notify_like on public.likes;
create trigger notify_like after insert on public.likes
  for each row execute function public.tg_notify_like();

create or replace function public.tg_notify_answer() returns trigger
language plpgsql security definer as $$
declare owner_id uuid;
begin
  select author_id into owner_id from public.discussion_questions where id = new.question_id;
  perform public.notify(owner_id, new.author_id, 'answer', new.question_id::text, 'question');
  return new;
end;
$$;
drop trigger if exists notify_answer on public.discussion_answers;
create trigger notify_answer after insert on public.discussion_answers
  for each row execute function public.tg_notify_answer();

create or replace function public.tg_notify_club_join() returns trigger
language plpgsql security definer as $$
declare owner_id uuid;
begin
  select organizer_id into owner_id from public.clubs where id = new.club_id;
  perform public.notify(owner_id, new.user_id, 'club', new.club_id::text, 'club');
  return new;
end;
$$;
drop trigger if exists notify_club_join on public.club_members;
create trigger notify_club_join after insert on public.club_members
  for each row execute function public.tg_notify_club_join();

-- ────────────────────────────────────────────────────────────
-- 2. 피드 댓글
-- ────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (char_length(btrim(content)) between 2 and 500),
  created_at timestamptz not null default now()
);
create index if not exists comments_post_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;
drop policy if exists "comments: 누구나 조회" on public.comments;
create policy "comments: 누구나 조회" on public.comments for select using (true);
drop policy if exists "comments: 본인만 등록" on public.comments;
create policy "comments: 본인만 등록" on public.comments
  for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "comments: 본인만 삭제" on public.comments;
create policy "comments: 본인만 삭제" on public.comments
  for delete to authenticated using (auth.uid() = author_id);

-- posts.comment_count 동기화
create or replace function public.tg_sync_comment_count() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    perform public.notify(
      (select author_id from public.posts where id = new.post_id),
      new.author_id, 'comment', new.post_id::text, 'post'
    );
    return new;
  else
    update public.posts set comment_count = greatest(0, comment_count - 1) where id = old.post_id;
    return old;
  end if;
end;
$$;
drop trigger if exists sync_comment_count on public.comments;
create trigger sync_comment_count after insert or delete on public.comments
  for each row execute function public.tg_sync_comment_count();

-- ────────────────────────────────────────────────────────────
-- 3. 신고 / 차단
-- ────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'comment', 'user')),
  target_id text not null,
  reason text not null,
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);
alter table public.reports enable row level security;
drop policy if exists "reports: 본인 신고만 조회" on public.reports;
create policy "reports: 본인 신고만 조회" on public.reports
  for select to authenticated using (auth.uid() = reporter_id);
drop policy if exists "reports: 본인만 등록" on public.reports;
create policy "reports: 본인만 등록" on public.reports
  for insert to authenticated with check (auth.uid() = reporter_id);

create table if not exists public.blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);
alter table public.blocks enable row level security;
drop policy if exists "blocks: 본인 것만 조회" on public.blocks;
create policy "blocks: 본인 것만 조회" on public.blocks
  for select to authenticated using (auth.uid() = blocker_id);
drop policy if exists "blocks: 본인만 등록" on public.blocks;
create policy "blocks: 본인만 등록" on public.blocks
  for insert to authenticated with check (auth.uid() = blocker_id);
drop policy if exists "blocks: 본인만 해제" on public.blocks;
create policy "blocks: 본인만 해제" on public.blocks
  for delete to authenticated using (auth.uid() = blocker_id);

-- ────────────────────────────────────────────────────────────
-- 4. 회원 탈퇴 — auth.users 삭제 → 전 테이블 on delete cascade
-- ────────────────────────────────────────────────────────────
create or replace function public.delete_my_account() returns void
language sql security definer as $$
  delete from auth.users where id = auth.uid();
$$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- ────────────────────────────────────────────────────────────
-- 5. 최소 스팸 방어 — 길이 제약 + 연속 등록 차단
-- ────────────────────────────────────────────────────────────
alter table public.posts drop constraint if exists posts_content_len;
alter table public.posts add constraint posts_content_len
  check (char_length(btrim(content)) between 2 and 2000);

create or replace function public.tg_rate_limit() returns trigger
language plpgsql security definer as $$
declare last_ts timestamptz;
begin
  execute format(
    'select max(created_at) from public.%I where author_id = $1', tg_table_name
  ) into last_ts using new.author_id;
  if last_ts is not null and last_ts > now() - interval '10 seconds' then
    raise exception '너무 빠르게 등록했어요. 잠시 후 다시 시도해주세요.';
  end if;
  return new;
end;
$$;
drop trigger if exists rate_limit_posts on public.posts;
create trigger rate_limit_posts before insert on public.posts
  for each row execute function public.tg_rate_limit();
drop trigger if exists rate_limit_comments on public.comments;
create trigger rate_limit_comments before insert on public.comments
  for each row execute function public.tg_rate_limit();
