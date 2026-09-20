-- 회원 탈퇴: 완전 삭제 → 익명화
--
-- 배경: 모든 테이블이 auth.users를 on delete cascade로 참조한다.
-- auth.users 행을 지우면 탈퇴자가 남의 스레드에 쓴 글·댓글·토론 답변까지
-- 통째로 사라져 대화에 구멍이 난다.
--
-- 방침
--  - profiles 행은 남기고 닉네임을 '탈퇴한 사용자'로, 나머지 프로필 정보는 파기.
--  - 글·댓글·답변 본문은 남긴다 (남의 스레드 보존).
--  - auth.users 행은 지우지 않는다 (지우면 위 cascade로 전부 삭제되므로).
--    대신 auth.identities(카카오 연결)를 삭제하고 email/전화/메타데이터를 파기한 뒤
--    banned_until을 먼 미래로 박아 같은 계정으로는 다시 로그인되지 않게 한다.
--    identity가 사라졌으므로 같은 카카오로 재가입하면 새 uuid의 새 계정이 생긴다.
--
-- Supabase 대시보드 > SQL Editor에 이 파일 전체를 붙여넣고 Run. 여러 번 실행해도 안전.

alter table public.profiles add column if not exists withdrawn_at timestamptz;

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

  -- 좋아요: posts.like_count는 likes 트리거가 맞춰주고,
  -- discussion_questions.like_count는 트리거가 없으므로 직접 차감한다.
  with removed as (
    delete from public.likes
     where user_id = uid and target_type <> 'post'
     returning target_id
  )
  update public.discussion_questions q
     set like_count = greatest(0, q.like_count - 1)
    from removed r
   where q.id::text = r.target_id;

  delete from public.likes where user_id = uid; -- 나머지(post 대상) — 트리거가 카운트 차감

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

revoke all on function public.withdraw_my_account() from public, anon;
grant execute on function public.withdraw_my_account() to authenticated;

-- 구 RPC 제거 (남겨두면 실수로 전체 삭제가 호출될 수 있다)
drop function if exists public.delete_my_account();
