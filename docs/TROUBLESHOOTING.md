# 트러블슈팅 기록

배경 → 판단 → 실행 → 결과 순서로 정리했다. 커밋 해시를 누르면 실제 변경을 볼 수 있다.

## 보안 · 데이터 정합성

### 좋아요 수를 아무나 조작할 수 있던 RPC — [`22a7229`](https://github.com/jjipper/book-jak/commit/22a7229)
- **배경** `increment_post_like` / `decrement_post_like`가 `security definer`라 RLS를 우회했다. 임의의 post id로 호출하면 남의 글 좋아요 수를 올리고 내릴 수 있었다.
- **판단** 호출자 검증을 덧붙이는 것보다, 카운트를 실제 데이터(`likes` 행)에서 파생시키는 쪽이 근본 해결이다. 카운트를 바꾸는 경로가 하나뿐이면 어긋날 일도 없다.
- **실행** `likes` insert/delete 트리거가 `posts.like_count`를 맞추게 하고 RPC를 삭제했다. 이미 어긋난 값은 마이그레이션에서 한 번 재계산했다.
- **결과** 조작 경로가 사라졌고, 카운트가 항상 실제 좋아요 수와 같다.

### RLS가 "행"만 막고 "컬럼"은 안 막던 문제 — [`098a57c`](https://github.com/jjipper/book-jak/commit/098a57c)
- **배경** RLS 자동 점검을 만들다 발견했다. `posts: 본인만 수정` 정책은 작성자에게 행 전체 수정을 허용해서, 작성자가 REST로 자기 글의 `like_count = 9999`를 보낼 수 있었다. 같은 구조로 모임 `member_count`(정원 마감 우회), 추천 `rec_count`(인기순 조작)도 열려 있었다. `books`는 로그인한 누구나 남이 등록한 책 제목을 덮어쓸 수 있었다.
- **판단** 컬럼 권한(`grant update (col…)`)은 컬럼이 늘 때마다 목록을 고쳐야 한다. 그래서 "집계 컬럼은 트리거만 고친다"를 트리거 깊이(`pg_trigger_depth()`)로 구분했다. 사용자의 직접 update는 깊이 1이고, 집계 트리거 안에서의 update는 깊이 2 이상이다.
- **실행** `BEFORE UPDATE` 트리거로 직접 update의 집계 컬럼을 옛 값으로 되돌렸다. `books` update 정책은 지우고, 앱은 `ignoreDuplicates`로 이미 있는 책을 건너뛰게 했다. RLS 없이 public에 있던 `_migrations`에도 RLS를 켰다.
- **결과** `pnpm rls:check`에 해당 시나리오를 넣어 회귀를 막는다.

### RLS 점검 자동화 — [`7f2d3b5`](https://github.com/jjipper/book-jak/commit/7f2d3b5)
- **배경** 런칭 문서에 "A·B 계정으로 로그인해 서로의 데이터를 건드려 본다"는 수동 절차만 있었다. 손으로 하면 정책을 바꿀 때마다 다시 하지 않게 된다.
- **판단** 실제 계정을 만들 필요가 없다. Supabase API는 결국 `role authenticated/anon` + JWT `sub`로 Postgres에 들어온다. 같은 조건을 트랜잭션 안에서 재현하고 롤백하면 된다.
- **실행** `scripts/rls-check.mjs` — 가상 사용자 A·B를 만들고 검사마다 savepoint로 격리해 남의 글 수정·삭제·사칭, 비로그인 쓰기, 집계 컬럼 조작, 본인 전용 테이블 엿보기, 토큰·알림 직접 생성, 책 정보 덮어쓰기를 시도한다. 끝나면 전부 롤백한다.
- **결과** 데이터를 남기지 않고 정책 회귀를 한 명령으로 확인한다.

### 토큰 지급·차감을 DB에서 원자적으로 — [`ca4af66`](https://github.com/jjipper/book-jak/commit/ca4af66)
- **배경** 블라인드 북 공개에 토큰 1개가 든다. 클라이언트에서 잔액을 확인하고 차감하면 조작이나 이중 차감(연타·동시 요청)이 가능하다.
- **실행** 지급(출석·글·댓글)과 차감을 모두 DB 함수·트리거로 옮겼다. `reveal_blind()`가 잔액 확인과 차감을 한 번에 처리하고, 이미 공개한 책은 무료다. 내역은 `token_ledger` 원장에 쌓아 잔액을 파생한다. API는 공개한 책의 정보만 내려줘서, 클라이언트에서 미리 볼 수 없다.

### 탈퇴를 삭제가 아니라 익명화로 — [`fb2ff75`](https://github.com/jjipper/book-jak/commit/fb2ff75)
- **배경** cascade 삭제라 탈퇴자의 댓글이 남의 스레드에서 사라져 대화에 구멍이 났다.
- **실행** `profiles` 행은 남기고 개인정보만 비웠다. `auth.identities`를 지워 카카오 연결을 끊었다(옛 계정이 되살아나지 않게). 팔로우·좋아요·알림은 정리하고 랭킹·매칭에서 제외했다. 실수로 호출될 수 있는 옛 전체 삭제 RPC는 제거했다.

## 안정성

### Supabase가 응답하지 않으면 화면이 통째로 멈추던 문제 — [`33dd039`](https://github.com/jjipper/book-jak/commit/33dd039)
- **배경** 프로젝트가 503일 때 `auth.getUser()`가 예외 없이 매달렸다. 그 뒤 코드가 멈춰 댓글이 "0개"로 굳었다.
- **판단** 예외가 안 나니 try/catch로는 못 잡는다. 무응답 자체를 타임아웃으로 처리해야 한다.
- **실행** `tryRemote()` — `Promise.race`로 3초 타임아웃을 걸고, 예외와 무응답을 둘 다 `null`로 바꾼다. 원격 호출을 전부 감싸고, 본문과 댓글이 서로를 기다리지 않게 effect를 나눴다.

### 서버 데이터가 기기 데이터를 덮어쓰던 문제 — [`3753052`](https://github.com/jjipper/book-jak/commit/3753052), [`a417f05`](https://github.com/jjipper/book-jak/commit/a417f05)
- **배경** 평가 탭에 들어가면 서버 사본으로 통째로 덮어써서, 다른 화면에서 준 별점이 사라졌다. 독서 유형은 아예 계정에 저장되지 않았다.
- **판단** 별점은 최근 값 기준으로 병합한다. 유형은 계정 값을 우선한다. 기기 값을 우선하면 공용 기기에서 앞사람 결과가 다음 사람 계정을 덮기 때문이다.
- **실행** 비로그인 때 얻은 결과는 첫 로그인 때 올리고, 새 기기에서는 계정 값으로 복원한다. 로그아웃하면 기기 데이터를 지운다. 같이 고친 것: 반 개 별점이 `smallint`라 저장에 실패하던 문제(`numeric`으로), 별점 취소가 0점 저장으로 제약에 걸리던 문제.

### 정원 마감이 영영 안 되던 모임 — [`723b9ce`](https://github.com/jjipper/book-jak/commit/723b9ce)
- 인원 수를 클라이언트가 따로 관리해서 실제 참여자와 어긋났다. 트리거로 맞추고, 정원 초과 참여는 DB에서 막았다.

## React · 렌더링

### `set-state-in-effect` lint 오류 20건 — [`499aa82`](https://github.com/jjipper/book-jak/commit/499aa82)
- **배경** localStorage 값을 마운트한 뒤 `useEffect`에서 `setState`로 채우는 패턴이 화면 전반에 퍼져 있었다. 렌더가 한 번씩 더 돌고, lint가 CI를 막았다.
- **판단** 규칙을 끄지 않고, "effect 안에서 상태를 맞추는" 대신 렌더 중에 파생시킨다.
- **실행**
  - `useSyncExternalStore` 기반 `useMounted()`로 하이드레이션이 어긋나지 않게 클라이언트 값을 읽음
  - prop→state 동기화를 지우고 prop에서 파생
  - 비동기 결과를 "그 결과를 낳은 입력"과 함께 저장해 로딩 여부까지 파생
  - `key`로 재마운트해서 초기화
- **결과** 18개 파일, lint 오류 0건.

### 로딩 중에 "아직 없어요"가 번쩍이던 문제 — [`ceb452a`](https://github.com/jjipper/book-jak/commit/ceb452a)
- 목록 12개 중 9개가 초기값 `[]`를 그대로 그렸다. 로딩 분기를 먼저 두고, 빈 상태에는 다음 행동 CTA를 붙였다. 규칙은 [`DESIGN.md`](./DESIGN.md)의 "상태와 방어"로 고정했다.

### 비로그인 쓰기가 조용히 실패하던 문제 — [`355e77f`](https://github.com/jjipper/book-jak/commit/355e77f)
- unhandled rejection만 나고 화면은 멀쩡해 보였다. `useAuthGate`를 붙이고, 글쓰기는 제출할 때가 아니라 시트를 여는 시점에 막았다.

## 성능 · 접근성

### 정적 이미지 164MB → 4.5MB — [`f789d2d`](https://github.com/jjipper/book-jak/commit/f789d2d)
- 배지 원본은 1254px PNG(총 98MB)인데 표시 크기는 56px였다. 표시 크기의 3배(192px) WebP로 줄였다. 일러스트도 표시 폭에 맞춰 WebP로 바꿨고, 코드에서 안 쓰던 아이콘 39MB는 레포에서 뺐다.

### 초기 로딩 — [`5e55276`](https://github.com/jjipper/book-jak/commit/5e55276)
- **배경** Lighthouse(모바일) 기준 홈 성능 65점, LCP 9.7s.
- **원인**
  - 1.7MB 인트로 PNG가 LCP 요소였다.
  - Pretendard를 CSS `@import`로 불러서 globals.css를 받은 뒤에야 폰트 CSS 요청이 시작됐다(렌더 차단 약 750ms).
  - 꾸밈 폰트가 1.2MB TTF였다.
- **실행**
  - Pretendard를 `<link>` + `preconnect`로 바꾸고, 페이지에 쓰인 글자만 받는 dynamic-subset 가변 폰트로 교체
  - 꾸밈 폰트 TTF → WOFF2 (1.2MB → 131KB)
  - 로고 PNG 218KB → WebP 58KB, `width`/`height`로 자리 확보
  - 첫 화면 그림만 `fetchpriority="high"`, 나머지는 `loading="lazy"`
- **결과** 아래 [측정](#측정) 참고.

### 대비 미달 — [`9fe7815`](https://github.com/jjipper/book-jak/commit/9fe7815)
- **배경** 캡션 회색(#9A9AA4)은 크림 배경 위에서 2.45:1, 주황 글자(#F0562E)는 3.04:1로 WCAG AA(4.5:1)에 못 미쳤다.
- **판단** 브랜드 주황을 통째로 바꾸지 않고, 의미 토큰을 하나 더 둔다. 면·아이콘은 브랜드 주황을 쓰고, 작은 글자만 대비를 맞춘 색을 쓴다.
- **실행** `--color-accent-text`(#BD320E) 신설, 글자에 쓰던 `--color-accent` 42곳을 교체했다. 캡션 회색은 #64646E로 바꿨다. 두 색 모두 화이트·크림·눌린 면(#E7E3D9) 세 면 위에서 4.5:1 이상이다. 토큰 구조 덕분에 primitive 두 개와 semantic 하나만 고치면 됐다.

## 측정

Lighthouse 모바일, https://book-jak.vercel.app 배포본 기준 (개선 전 1회, 개선 후 3회 중앙값).

| 페이지 | 성능 점수 | LCP | 전송량 |
|---|---|---|---|
| 홈 | 65 → 78 | 9.7s → 5.7s | 2,299KB → 788KB |
| 테스트 | 71 → 77 | 9.0s → 5.1s | 2,516KB → 898KB |
| 블라인드 북 | 73 → 79 | 6.2s → 5.0s | 1,141KB → 763KB |

- LCP는 아직 5초대다. 남은 원인은 첫 화면 일러스트(212KB)의 로드 지연과 JS 번들이다. 다음 단계로 일러스트를 반응형 크기(`srcset`)로 나누고, 홈의 클라이언트 컴포넌트 범위를 줄인다.
- 접근성 점수는 95~96이다. 남은 감점은 주황 채움 버튼의 흰 글자(3.46:1)다. 브랜드 주황 자체를 바꾸는 결정이라 보류했다.
