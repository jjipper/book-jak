-- 차단한 사람이 일으킨 알림은 만들지 않는다.
--
-- 모든 알림 트리거(팔로우·좋아요·댓글·모임 참여·새 글·추천·후기)가 public.notify()를 거친다.
-- 0015의 새 글 알림만 차단을 따로 확인하고 있었고, 나머지는 차단한 사람의 알림이 그대로 왔다.
-- 공통 함수 한 곳에서 걸러 모든 경로에 적용한다.
--
-- 0003 이후 아무 때나 실행해도 된다. 여러 번 실행해도 안전하다.

create or replace function public.notify(
  p_user uuid, p_actor uuid, p_type text, p_target text, p_target_type text
) returns void language plpgsql security definer set search_path = public as $$
begin
  if p_user is null or p_user = p_actor then return; end if;

  -- 받는 사람이 행동한 사람을 차단했으면 알리지 않는다
  if p_actor is not null and exists (
    select 1 from public.blocks where blocker_id = p_user and blocked_id = p_actor
  ) then
    return;
  end if;

  insert into public.notifications (user_id, actor_id, type, target_id, target_type)
  values (p_user, p_actor, p_type, p_target, p_target_type);
end;
$$;
