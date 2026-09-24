-- 트랙 B — 목업 제거 / 실데이터 전환에 필요한 보강
-- schema.sql은 건드리지 않는다. 이 파일만 추가로 실행하면 된다.

-- 1) books 업서트가 RLS에 막히는 버그
--    pushRating()은 books를 upsert하는데, 이미 다른 사용자가 등록한 책이면
--    insert가 아니라 update로 떨어진다. books에는 update 정책이 없어서 평가 저장 전체가 실패했다.
drop policy if exists "books: 로그인 사용자 수정" on public.books;
create policy "books: 로그인 사용자 수정" on public.books
  for update to authenticated using (true) with check (true);

-- 2) 랭킹 집계 뷰
--    기존 localStorage 활동점수(shared/lib/activity.ts)와 같은 배점을 서버에서 재현한다.
--    평가 5 / 리뷰 5 / 질문 8 / 답변 4 / 모임개설 10 / 모임참여 5 / 글쓰기 5
--    (테스트·블라인드 평가는 비로그인도 가능한 로컬 활동이라 서버 점수에서 제외)
create or replace view public.reading_ranking
with (security_invoker = on) as
select
  p.id                          as user_id,
  p.nickname,
  p.type_code,
  coalesce(r.cnt, 0)            as ratings_count,
  coalesce(r.review_cnt, 0)     as reviews_count,
  coalesce(q.cnt, 0)            as questions_count,
  coalesce(a.cnt, 0)            as answers_count,
  coalesce(c.cnt, 0)            as clubs_created,
  coalesce(m.cnt, 0)            as clubs_joined,
  coalesce(po.cnt, 0)           as posts_count,
  coalesce(r.cnt, 0) * 5
    + coalesce(r.review_cnt, 0) * 5
    + coalesce(q.cnt, 0) * 8
    + coalesce(a.cnt, 0) * 4
    + coalesce(c.cnt, 0) * 10
    + coalesce(m.cnt, 0) * 5
    + coalesce(po.cnt, 0) * 5   as score
from public.profiles p
left join (
  select user_id,
         count(*) as cnt,
         count(*) filter (where review is not null and btrim(review) <> '') as review_cnt
  from public.ratings group by user_id
) r on r.user_id = p.id
left join (select author_id, count(*) as cnt from public.discussion_questions group by author_id) q on q.author_id = p.id
left join (select author_id, count(*) as cnt from public.discussion_answers   group by author_id) a on a.author_id = p.id
left join (select organizer_id, count(*) as cnt from public.clubs             group by organizer_id) c on c.organizer_id = p.id
left join (select user_id, count(*) as cnt from public.club_members           group by user_id) m on m.user_id = p.id
left join (select author_id, count(*) as cnt from public.posts                group by author_id) po on po.author_id = p.id;

grant select on public.reading_ranking to anon, authenticated;

-- 3) 팔로워/팔로잉 수 집계 뷰 (프로필 목록에서 N+1 쿼리를 피하려고)
create or replace view public.profile_follow_counts
with (security_invoker = on) as
select
  p.id as user_id,
  (select count(*) from public.follows f where f.followee_id = p.id) as follower_count,
  (select count(*) from public.follows f where f.follower_id = p.id) as following_count
from public.profiles p;

grant select on public.profile_follow_counts to anon, authenticated;
