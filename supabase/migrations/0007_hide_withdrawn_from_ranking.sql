-- 탈퇴자를 랭킹에서 뺀다.
--
-- 0006이 탈퇴를 '완전 삭제'에서 '익명화'로 바꾸면서 profiles 행이 남게 됐다.
-- reading_ranking은 profiles를 그대로 읽으므로 '탈퇴한 사용자'가 순위에 계속 뜬다.
--
-- 0006 다음에 실행할 것 (withdrawn_at 컬럼이 있어야 한다).
-- 0002의 뷰 정의를 그대로 두고 마지막 where 한 줄만 더했다.

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
left join (select author_id, count(*) as cnt from public.posts                group by author_id) po on po.author_id = p.id
where p.withdrawn_at is null;

grant select on public.reading_ranking to anon, authenticated;
