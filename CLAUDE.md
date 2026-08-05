@AGENTS.md
@docs/design/DESIGN_PRINCIPLES.md

## 커밋 규칙

- 커밋 전 `git config user.name` / `user.email` 확인 — `jjipper` 계정인지 반드시 체크
- `Co-Authored-By: Claude ...` 줄 절대 넣지 말 것
- 커밋 메시지 앞에 타입 prefix 필수: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:`
- 기능 단위로 파일을 나눠 커밋 (한 커밋에 연관 없는 변경 섞지 않기)
- 제목은 한국어, 명사형 또는 동사 원형으로 간결하게
- `package-lock.json` / `pnpm-lock.yaml` 등 lock 파일은 별도 `chore:` 커밋으로 처리

## FSD 구조 (이 프로젝트 변형 규칙)

표준 FSD를 그대로 따르지 않음 — 아래 규칙을 우선한다.

- 레이어: `app / views / widgets / features / entities / shared`. `views` 레이어가 추가로 있다.
- `app/`은 라우팅 껍데기만 담당하고 실제 로직은 두지 않는다. 페이지 컴포넌트는 `views/*/ui/*View.tsx`를 렌더링만 위임한다.
- `views/` 폴더명은 라우트 경로를 kebab-case로 평탄화한 것이다. 예: `social/clubs/[id]` → `views/social-club-detail`, `social` 루트 → `views/social-hub`. 새 라우트를 만들 때 이 매핑 규칙을 지킨다.
- `entities/*`는 `ui/model/api`를 항상 다 갖추지 않는다. 해당 엔티티가 실제로 필요한 서브폴더만 만든다 (예: `book`은 `model/`만, `user`는 `model/`+`api/`+`ui/`). "entity니까 3종 폴더를 다 만들어야 한다"는 규칙은 이 프로젝트에 없다.
- `features/*` 폴더명은 동사형이 아니라 명사형으로 짓는다 (예: `nickname-gate`, `follow`, `like`, `wishlist`).
- 리팩토링·기능 삭제 시에는 관련 파일(컴포넌트, model, api, 타입, import 참조, 사용하지 않게 된 라우트/뷰 폴더)을 전부 찾아서 깨끗하게 지운다. 흔적(죽은 export, orphan 파일, 주석 처리된 코드)을 남기지 않는다.

## Supabase 클라이언트 — 용도별로 구분해서 사용

`src/shared/api/`에 클라이언트 헬퍼가 3개 있다. 용도를 섞어 쓰지 않는다.

- `supabase-browser.ts` (`createBrowserClient`) → 클라이언트 컴포넌트에서 사용
- `supabase-server.ts` (`createServerClient`) → 서버 컴포넌트 / 라우트 핸들러에서 사용
- `supabase.ts` (`getSupabase()`) → 레거시 패턴. 신규 코드에서 쓰지 않는다.

## 상태관리 기준선

- zustand는 전역 상태가 정말 필요할 때만 쓴다 (여러 컴포넌트가 구독하고 리렌더링이 필요한 경우).
- 단순 저장/조회성 상태는 `entities/*/model/*.ts`의 순수 함수 + localStorage 헬퍼 패턴을 따른다 (예: `getNickname`/`setNickname`, `getLikedIds`).
- 새 스토어를 만들기 전에 정말 zustand가 필요한지, 기존 model 함수 패턴으로 충분한지 먼저 판단한다.

## 네이밍 컨벤션

- 뷰 컴포넌트: `<PascalCase>View.tsx` (폴더명 kebab-case → 컴포넌트명 PascalCase + `View` 접미사)
- API 함수 파일: `*Remote.ts`
- localStorage 액션 모음 파일: `*Actions.ts`
- 전역 `types/` 폴더는 없다. 타입은 그 타입을 소비하는 도메인의 `model/*.ts`에 인라인으로 정의한다.
