-- 의견 나누기(토론) 제거 + 랭킹을 주간으로
--
-- 0006·0007 다음에 실행할 것 (withdrawn_at 컬럼, reading_ranking 뷰가 있어야 한다).
-- 앱 배포와 같은 타이밍에 실행한다. 새 앱은 reading_ranking_weekly를 읽고,
-- 옛 앱은 reading_ranking을 읽으므로 둘 사이에는 랭킹이 잠깐 비어 보인다.
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전.

begin;

-- 1) 옛 누적 랭킹 뷰 — 토론 테이블을 참조하므로 테이블보다 먼저 치운다.
--    컬럼(questions_count 등)이 빠져서 create or replace로는 못 바꾼다.
drop view if exists public.reading_ranking;

-- 2) 주간 랭킹 — 이번 주 월요일 0시(KST)부터의 활동만 센다.
--    배점: 평가 5 / 리뷰 5 / 모임개설 10 / 모임참여 5 / 글쓰기 5 (토론 항목만 뺐다)
--    평가·리뷰는 ratings.created_at 기준 — 옛 평가에 이번 주 리뷰를 덧붙인 건 세지 않는다.
create or replace view public.reading_ranking_weekly
with (security_invoker = on) as
with wk as (
  select date_trunc('week', now() at time zone 'Asia/Seoul') at time zone 'Asia/Seoul' as since
)
select * from (
  select
    p.id                          as user_id,
    p.nickname,
    p.type_code,
    coalesce(r.cnt, 0)            as ratings_count,
    coalesce(r.review_cnt, 0)     as reviews_count,
    coalesce(c.cnt, 0)            as clubs_created,
    coalesce(m.cnt, 0)            as clubs_joined,
    coalesce(po.cnt, 0)           as posts_count,
    coalesce(r.cnt, 0) * 5
      + coalesce(r.review_cnt, 0) * 5
      + coalesce(c.cnt, 0) * 10
      + coalesce(m.cnt, 0) * 5
      + coalesce(po.cnt, 0) * 5   as score
  from public.profiles p
  left join (
    select user_id,
           count(*) as cnt,
           count(*) filter (where review is not null and btrim(review) <> '') as review_cnt
    from public.ratings, wk where created_at >= wk.since group by user_id
  ) r on r.user_id = p.id
  left join (select organizer_id, count(*) as cnt from public.clubs, wk        where created_at >= wk.since group by organizer_id) c on c.organizer_id = p.id
  left join (select user_id, count(*) as cnt from public.club_members, wk      where joined_at  >= wk.since group by user_id) m on m.user_id = p.id
  left join (select author_id, count(*) as cnt from public.posts, wk           where created_at >= wk.since group by author_id) po on po.author_id = p.id
  where p.withdrawn_at is null
) t
where score > 0;

grant select on public.reading_ranking_weekly to anon, authenticated;

-- 3) 좋아요 알림 — 이제 글(post)만 대상. 0003 정의는 토론 질문을 조회한다.
create or replace function public.tg_notify_like() returns trigger
language plpgsql security definer as $$
declare owner_id uuid;
begin
  if new.target_type <> 'post' then
    return new;
  end if;
  select author_id into owner_id from public.posts where id::text = new.target_id;
  perform public.notify(owner_id, new.user_id, 'like', new.target_id, 'post');
  return new;
end;
$$;

-- 4) 회원 탈퇴 — 0006 정의에서 토론 질문 like_count 차감 블록만 뺐다.
create or replace function public.withdraw_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid();
begin
  if uid is null then
    raise exception '로그인이 필요합니다.';
  end if;
  if exists (select 1 from public.profiles where id = uid and withdrawn_at is not null) then
    return; -- 이미 탈퇴 처리됨
  end if;

  -- 1) 프로필 개인정보 파기 (행은 남겨 글의 작성자 표시에 쓴다)
  update public.profiles
     set nickname       = '탈퇴한 사용자',
         avatar_url     = null,
         bio            = null,
         type_code      = null,
         favorite_tags  = '{}',
         activity_score = 0,
         withdrawn_at   = now(),
         updated_at     = now()
   where id = uid;

  -- 표시용 닉네임 스냅샷도 함께
  update public.ratings set nickname = '탈퇴한 사용자' where user_id = uid;

  -- 2) 관계·개인 기록 정리 (유령 팔로워/좋아요 방지)
  delete from public.follows where follower_id = uid or followee_id = uid;
  delete from public.blocks  where blocker_id = uid or blocked_id = uid;
  delete from public.blind_reactions where user_id = uid;
  delete from public.notifications  where user_id = uid or actor_id = uid;
  delete from public.likes where user_id = uid; -- posts.like_count는 likes 트리거가 차감

  -- 3) 계정 파기 — auth.users 행 자체는 cascade 때문에 남긴다
  delete from auth.identities where user_id = uid;
  delete from auth.sessions   where user_id = uid;
  update auth.users
     set email               = null,
         phone               = null,
         raw_user_meta_data  = '{}'::jsonb,
         banned_until        = timestamptz '9999-12-31',
         updated_at          = now()
   where id = uid;
end;
$$;

-- 5) 토론에 딸린 데이터 정리
--    notifications.type check의 'answer'는 남겨둔다 — 만드는 트리거가 없어져 새로 생기지 않고,
--    제약 이름을 추측해 바꾸다 실패하는 쪽이 더 위험하다.
delete from public.notifications where type = 'answer' or target_type = 'question';
delete from public.likes where target_type = 'question';
alter table public.likes alter column target_type set default 'post';

-- 6) 테이블 drop — notify_answer 트리거와 RLS 정책은 테이블과 함께 사라진다.
drop table if exists public.discussion_answers;
drop table if exists public.discussion_questions;
drop function if exists public.tg_notify_answer();

commit;
