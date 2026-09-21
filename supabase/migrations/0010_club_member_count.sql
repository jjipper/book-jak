-- clubs.member_count를 club_members에서 파생시키고, 정원 초과 참여를 DB에서 막는다.
--
-- 기존: member_count를 아무도 갱신하지 않아 정원 마감이 영영 안 됐고,
-- 앱 체크만 있어 누구나 club_members에 insert하면 무한 참여가 가능했다.
--
-- 이후: club_members insert/delete 트리거가 카운트를 맞춘다.
-- insert는 "member_count < capacity"일 때만 증가시키고, 아니면 'club_full' 예외로 insert 자체를 롤백.
-- update가 clubs 행을 잠그므로 동시 참여도 직렬화된다.
-- 주최자도 club_members 행이 있으므로 새 모임은 0에서 시작해 주최자 insert로 1이 된다.

create or replace function public.tg_sync_club_member_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.clubs set member_count = member_count + 1
    where id = new.club_id and member_count < capacity;
    if not found then
      raise exception 'club_full' using errcode = 'P0001';
    end if;
    return new;
  else
    update public.clubs set member_count = greatest(0, member_count - 1)
    where id = old.club_id;
    return old;
  end if;
end;
$$;

drop trigger if exists sync_club_member_count on public.club_members;
create trigger sync_club_member_count after insert or delete on public.club_members
  for each row execute function public.tg_sync_club_member_count();

alter table public.clubs alter column member_count set default 0;

-- 기존 값은 실제 멤버 수와 어긋나 있으므로 한 번 재계산한다.
update public.clubs c
set member_count = (select count(*) from public.club_members m where m.club_id = c.id);
