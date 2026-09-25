-- 추천 작성 화면에서 "요청 + 책 여러 권"을 한 번에 등록할 수 있게 한다.
-- 여러 번 실행해도 안전.

-- ────────────────────────────────────────────────────────────
-- 1. 설명(mood)을 충분히 길게 — 한 줄 분위기에서 설명 문단으로
-- ────────────────────────────────────────────────────────────
alter table public.rec_requests drop constraint if exists rec_requests_mood_check;
alter table public.rec_requests add constraint rec_requests_mood_check
  check (mood is null or char_length(btrim(mood)) between 2 and 500);

-- ────────────────────────────────────────────────────────────
-- 2. 추천 연타 방지(10초)는 '다른 요청'에 대해서만 건다.
--    한 요청에 책을 여러 권 담는 건 정상 동작이고, 그쪽은 1인 10권 제한
--    (tg_guard_recommendation)이 이미 막는다.
-- ────────────────────────────────────────────────────────────
create or replace function public.tg_rate_limit_recommendation() returns trigger
language plpgsql security definer set search_path = public as $$
declare last_ts timestamptz;
begin
  select max(created_at) into last_ts from public.recommendations
   where author_id = new.author_id and request_id <> new.request_id;
  if last_ts is not null and last_ts > now() - interval '10 seconds' then
    raise exception '너무 빠르게 등록했어요. 잠시 후 다시 시도해주세요.';
  end if;
  return new;
end;
$$;
drop trigger if exists rate_limit_recommendations on public.recommendations;
create trigger rate_limit_recommendations before insert on public.recommendations
  for each row execute function public.tg_rate_limit_recommendation();
