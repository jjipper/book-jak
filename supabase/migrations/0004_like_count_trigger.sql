-- posts.like_count를 likes 테이블에서 파생시킨다.
--
-- 기존: 앱이 likes 행을 쓴 뒤 increment_post_like/decrement_post_like RPC를 따로 호출.
-- 두 함수가 security definer라 RLS를 우회했고, 임의의 post_id로 호출하면
-- 실제 좋아요와 무관하게 카운트를 조작할 수 있었다.
--
-- 이후: likes insert/delete 트리거가 카운트를 맞춘다. RPC는 제거.

create or replace function public.tg_sync_post_like_count() returns trigger
language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    if new.target_type = 'post' then
      update public.posts set like_count = like_count + 1
      where id = new.target_id::uuid;
    end if;
    return new;
  else
    if old.target_type = 'post' then
      update public.posts set like_count = greatest(0, like_count - 1)
      where id = old.target_id::uuid;
    end if;
    return old;
  end if;
end;
$$;

drop trigger if exists sync_post_like_count on public.likes;
create trigger sync_post_like_count after insert or delete on public.likes
  for each row execute function public.tg_sync_post_like_count();

-- RPC로 누적된 값이 실제 좋아요 수와 어긋나 있으므로 한 번 재계산한다.
update public.posts p
set like_count = coalesce((
  select count(*) from public.likes l
  where l.target_type = 'post' and l.target_id = p.id::text
), 0);

drop function if exists public.increment_post_like(uuid);
drop function if exists public.decrement_post_like(uuid);
