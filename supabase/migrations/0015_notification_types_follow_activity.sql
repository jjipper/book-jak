-- 알림 개편 — 팔로우의 효용
--   1) notifications.type 확장: new_post / recommend / rec_review
--   2) 팔로우한 사람이 새 글을 쓰면 팔로워에게 'new_post' (작성자별 팔로워당 하루 1건)
--   3) 팔로잉 활동 피드 RPC — following_activity()
--
-- 0016(추천 알림 트리거)보다 먼저 실행할 것. 여러 번 실행해도 안전하다.

-- 1) type 제약 — 'answer'는 더 생성되지 않지만 과거 행 보존을 위해 남긴다
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('follow', 'like', 'comment', 'answer', 'club', 'new_post', 'recommend', 'rec_review'));

-- 2) 새 글 → 팔로워 알림
-- 폭주 방지: 같은 작성자의 new_post는 팔로워별 24시간에 1건. 작성자를 차단한 팔로워는 제외.
-- (중복 검사는 notifications_user_idx (user_id, created_at desc)를 탄다)
create or replace function public.tg_notify_new_post() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform public.notify(f.follower_id, new.author_id, 'new_post', new.id::text, 'post')
    from public.follows f
   where f.followee_id = new.author_id
     and not exists (
       select 1 from public.blocks b
        where b.blocker_id = f.follower_id and b.blocked_id = new.author_id)
     and not exists (
       select 1 from public.notifications n
        where n.user_id = f.follower_id and n.actor_id = new.author_id
          and n.type = 'new_post' and n.created_at > now() - interval '1 day');
  return new;
end;
$$;
drop trigger if exists notify_new_post on public.posts;
create trigger notify_new_post after insert on public.posts
  for each row execute function public.tg_notify_new_post();

-- 3) 팔로잉 활동 — 내가 팔로우한 사람들의 새 글 + 별점 (최신순)
-- posts·ratings·follows·profiles·books 모두 공개 조회라 security invoker로 충분하다.
create or replace function public.following_activity(p_limit int default 50)
returns table (
  kind text,            -- 'post' | 'rating'
  actor_id uuid,
  actor_nickname text,
  target_id text,       -- post: posts.id / rating: books.id
  title text,           -- post: 책 제목 또는 본문 앞부분 / rating: 책 제목
  stars numeric,        -- rating만
  ts timestamptz
)
language sql stable security invoker set search_path = public as $$
  select a.kind, a.actor_id, pr.nickname, a.target_id, a.title, a.stars, a.ts
    from (
      select 'post'::text as kind, p.author_id as actor_id, p.id::text as target_id,
             coalesce(p.book_title, left(p.content, 40)) as title, null::numeric as stars,
             p.created_at as ts
        from public.posts p
        join public.follows f on f.followee_id = p.author_id and f.follower_id = auth.uid()
      union all
      select 'rating', r.user_id, r.book_id, b.title, r.stars, r.updated_at
        from public.ratings r
        join public.books b on b.id = r.book_id
        join public.follows f on f.followee_id = r.user_id and f.follower_id = auth.uid()
    ) a
    left join public.profiles pr on pr.id = a.actor_id
   order by a.ts desc
   limit least(greatest(p_limit, 1), 100);
$$;
revoke all on function public.following_activity(int) from public;
grant execute on function public.following_activity(int) to authenticated;
