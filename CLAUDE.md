# CLAUDE.md

## 문서 참조

- **Next.js 버전별 규칙** → `AGENTS.md` (도구 자동 관리, 수정 금지)
- **제품 사양** → `docs/PRD.md`
- **디자인 규칙** → `docs/DESIGN.md`
- **구조·폴더 규칙** → `docs/ARCHITECTURE.md`

---

## 커밋 규칙

- 커밋 전 `git config user.name` / `user.email`이 `jjipper` 계정인지 확인.
- `Co-Authored-By: Claude ...` 넣지 않는다.
- 제목 앞에 타입 prefix 필수: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:`.
- **기능 단위로 커밋.** 한 커밋에 연관 없는 변경을 섞지 않는다.
- 제목은 한국어, 명사형 또는 동사 원형으로 간결하게.
- lock 파일(`package-lock.json`, `pnpm-lock.yaml` 등)은 별도 `chore:` 커밋으로.

---

## Supabase 클라이언트 — 용도별 구분

`src/shared/api/`에 헬퍼 3개가 있다. 용도를 섞지 않는다.

- `supabase-browser.ts` (`createBrowserClient`) → **클라이언트 컴포넌트**
- `supabase-server.ts` (`createServerClient`) → **서버 컴포넌트 / 라우트 핸들러**
- `supabase.ts` (`getSupabase()`) → **레거시. 신규 코드에서 쓰지 않는다.**

---

## 상태 관리 기준선

- **zustand는 전역 상태가 정말 필요할 때만.** (여러 컴포넌트가 구독하고 함께 리렌더링돼야 하는 경우)
- **단순 저장/조회성 상태**는 `entities/*/model/*.ts`의 순수 함수 + localStorage 헬퍼 패턴을 따른다.
  예: `getNickname` / `setNickname`, `getLikedIds`.
- 새 스토어를 만들기 전에, 기존 model 함수 패턴으로 충분하지 않은지 먼저 판단한다.

---

## 네이밍 컨벤션

- **뷰 컴포넌트** — `<PascalCase>View.tsx` (폴더명 kebab-case → 컴포넌트명 PascalCase + `View`)
- **API 함수 파일** — `*Remote.ts`
- **localStorage 액션 모음** — `*Actions.ts`
- **전역 `types/` 폴더는 없다.** 타입은 그 타입을 소비하는 도메인의 `model/*.ts`에 인라인 정의.
