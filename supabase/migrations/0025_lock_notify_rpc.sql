-- notify()를 API에서 호출하지 못하게 한다.
--
-- 문제: notify는 security definer라 RLS를 우회해 notifications에 쓴다. 실행 권한이 PUBLIC에
-- 열려 있어, 비로그인 사용자도 /rpc/notify로 아무에게나 아무 actor 이름의 알림을 만들 수 있었다.
-- 방법: 호출처는 전부 security definer 트리거(tg_notify_* 등, 소유자 권한으로 실행)라
-- API 역할의 실행 권한만 걷으면 된다.

revoke execute on function public.notify(uuid, uuid, text, text, text) from public, anon, authenticated;
