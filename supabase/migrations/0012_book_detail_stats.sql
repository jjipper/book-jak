-- 책 상세 화면의 커뮤니티 통계를 한 번에 돌려준다.
--
-- ratings는 RLS 밖 집계가 필요해 security definer 함수가 숫자만 내보낸다.
--
-- 반환(json):
--   typeCount  p_type_code 유형(profiles.type_code) 중 이 책을 평가한 사람 수
--   typeAvg    그 평균 별점 — 3명 이상일 때만, 아니면 null
--   alsoLiked  이 책에 4점 이상 준 사람들이 4점 이상 준 다른 책 상위 6권 [{id,title,author,thumbnail,likes}]
--
-- 여러 번 실행해도 안전하다.

create or replace function public.book_detail_stats(p_book_id text, p_type_code text default null)
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'typeCount', t.n,
    'typeAvg', case when t.n >= 3 then t.avg end,
    'alsoLiked', coalesce((
      select json_agg(x order by x.likes desc, x.title)
      from (
        select b.id, b.title, array_to_string(b.authors, ', ') as author, b.thumbnail, count(*) as likes
        from ratings mine
        join ratings other
          on other.user_id = mine.user_id
         and other.book_id <> p_book_id
         and other.stars >= 4
        join books b on b.id = other.book_id
        where mine.book_id = p_book_id
          and mine.stars >= 4
          and b.id like 'isbn-%' -- 상세 화면이 있는 책만
        group by b.id, b.title, b.authors, b.thumbnail
        order by count(*) desc, b.title
        limit 6
      ) x
    ), '[]'::json)
  )
  from (
    select count(*) as n, round(avg(r.stars), 1) as avg
    from ratings r
    join profiles p on p.id = r.user_id
    where r.book_id = p_book_id
      and p_type_code is not null
      and p.type_code = p_type_code
  ) t;
$$;

revoke all on function public.book_detail_stats(text, text) from public;
grant execute on function public.book_detail_stats(text, text) to anon, authenticated;
