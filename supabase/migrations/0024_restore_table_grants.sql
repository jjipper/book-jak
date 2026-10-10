-- API 역할의 테이블 권한을 되살린다.
--
-- 문제: 프로젝트 일시정지 → 복구 후 public 테이블의 anon/authenticated/service_role 표 단위
-- 권한(select·insert·update·delete)이 빠져 있었다. 기본 권한(default privileges)도
-- postgres 소유 테이블에 Dxtm만 주게 바뀌어 있어, 앞으로 만드는 테이블도 같은 상태가 된다.
-- RLS 정책은 그대로라 "행 조건"은 살아 있었지만, 그 앞단의 표 권한에서 전부 거부됐다.
--
-- 방법: Supabase 기본 모델(표 권한은 열고 행은 RLS가 거른다)로 되돌리되,
--  - anon은 읽기만 (모든 쓰기는 로그인 필요)
--  - 컬럼 단위로 insert/update를 열어 둔 테이블(0016·0019)은 표 단위 insert/update를 주지 않는다
--  - _migrations는 계속 닫는다 (0023)

do $$
declare
  t text;
  column_guarded text[] := array['clubs', 'rec_requests', 'recommendations', 'rec_reads', 'rec_saves'];
begin
  for t in
    select c.relname from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind in ('r', 'v', 'm')
      and c.relname <> '_migrations'
  loop
    execute format('grant select on public.%I to anon, authenticated, service_role', t);
  end loop;

  for t in
    select c.relname from pg_class c
    where c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
      and c.relname <> '_migrations'
  loop
    execute format('grant insert, update, delete on public.%I to service_role', t);
    if t = any (column_guarded) then
      execute format('grant delete on public.%I to authenticated', t);
    else
      execute format('grant insert, update, delete on public.%I to authenticated', t);
    end if;
  end loop;
end;
$$;

grant usage, select on all sequences in schema public to authenticated, service_role;

-- 앞으로 만드는 테이블도 같은 기준. 컬럼 단위로 막을 테이블은 0016처럼 만든 직후 revoke한다.
alter default privileges for role postgres in schema public
  grant select on tables to anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  grant insert, update, delete on tables to authenticated, service_role;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to authenticated, service_role;
