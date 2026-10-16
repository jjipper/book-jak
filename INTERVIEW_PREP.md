# 북작(book-jak) 프론트엔드 면접 준비

> 작성 기준: 2026-10-16 레포 상태 (최신 커밋 `d6d1a23`, 커밋 50개, 모두 jjipper).
> 아래 내용은 전부 **실제 파일을 열어 확인한 것**만 적었다. 확인하지 못한 것은 "확인 못 함"으로 표시했다.
> 코드는 한 줄도 수정하지 않았다.

## 0. 먼저 알아야 할 것 — 지원서와 코드가 다른 부분

면접 전에 반드시 머릿속에서 고쳐야 할 것 두 가지.

1. **책 API는 카카오가 아니라 알라딘(Aladin TTB API)이다.**
   `src/app/api/aladdin/` 아래 `list` · `search` · `lookup` 세 라우트와 `aladdinApi.ts`가 있고, 환경변수는 `ALADDIN_TTB_KEY`다.
   카카오 도서 API 흔적은 현재 코드에 없다. 최초 커밋(`a4e89bf`, 제목 "책 정보를 알라딘으로 통일")에 `scripts/fetch-covers.mjs`가 `dapi.kakao.com/v3/search/book`을 쓴 흔적이 있을 뿐이고, 그 스크립트도 지금은 알라딘으로 바뀌었다.
   → 면접에서 "카카오 도서 API"라고 말하면 레포를 본 면접관과 바로 어긋난다. **카카오는 로그인(OAuth)에만 쓴다**고 정리할 것.

2. **"디자인 시스템을 컴포넌트로 만들어 전 화면에서 사용"은 반만 맞다.**
   `src/shared/ui/Button.tsx` · `Chip.tsx` · `Card.tsx` 같은 React 컴포넌트는 존재하지만 **화면(views/widgets/features/entities)에서 쓰인 곳이 0건**이다.
   화면은 `className="bj-btn bj-btn--primary"`처럼 **CSS 클래스를 직접** 쓴다 (`bj-btn` 76회, `bj-chip` 65회, `bj-card` 44회).
   실제로 화면에서 쓰는 공용 React 컴포넌트는 `BackLink`(23), `IllustPlaceholder`(19), `LoginGateSheet`(14), `Icon`(12), `TypeBadge`(10), `Stars`/`StarRating`, `ConfirmSheet`, `Sheet`, `Option`, `Logo`, `Input`, `BottomNav/NavItem` 정도다.
   → "디자인 시스템 = `components.css`의 `.bj-*` 클래스 체계 + 상태가 필요한 것만 React 래퍼"라고 정확히 말해야 한다. 자세한 건 4장.

---

## 1. 프로젝트 한눈에 보기 (코드 기준)

| 항목 | 실제 값 | 근거 |
|---|---|---|
| 프레임워크 | Next.js **16.2.9** (App Router), React 19.2.4, TypeScript strict | `package.json`, `tsconfig.json` |
| 백엔드 | Supabase (`@supabase/ssr` 0.12.4, `@supabase/supabase-js` 2.112) | `package.json` |
| 전역 상태 | zustand 5 — 스토어 **2개** | `src/shared/lib/toast.ts`, `src/features/quiz-test/model/testStore.ts` |
| 외부 API | 알라딘 TTB (서버 라우트 프록시) | `src/app/api/aladdin/*` |
| 테스트 | Vitest 5, 테스트 파일 3개 / 18개 **전부 통과** (직접 실행 확인) | `src/entities/*/model/*.test.ts` |
| 품질 | `tsc --noEmit` 통과, ESLint 에러 0 / 경고 2 (`og-card.tsx`의 `<img>`) | 직접 실행 확인 |
| CI | GitHub Actions: install → lint → typecheck → test | `.github/workflows/ci.yml` |
| 배포 | Vercel (README), `@vercel/analytics` + `speed-insights` 를 루트 레이아웃에 삽입 | `src/app/layout.tsx` |
| 파일 수 | `src/` 215개. `page.tsx` 40개 중 29개가 5줄(뷰 렌더만) | `find` 결과 |
| DB | `supabase/schema.sql` + 마이그레이션 24개 (`0002`~`0025`) | `supabase/migrations/` |

---

## 2. 예상 질문 (중요도 순)

---

### Q1. 폴더 구조가 FSD라고 했는데, 레이어가 뭐고 왜 `pages` 대신 `views`를 썼나요?

- **근거 파일**: `docs/ARCHITECTURE.md`, `README.md`(아키텍처 특징), `src/` 최상위 6개 폴더, `src/app/(main)/home/page.tsx`
- **기본 개념**
  FSD(Feature-Sliced Design)는 폴더를 "기능 종류"가 아니라 **"추상화 높이"** 로 층층이 나누는 방식이다. 건물에 비유하면 아래층(shared)은 기초 공사, 위층(app)은 인테리어. **위층은 아래층을 쓸 수 있지만, 아래층이 위층을 알면 안 된다.** 그래야 아래층 하나를 바꿔도 다른 층이 안 무너진다.
  표준 FSD 레이어: `app → pages → widgets → features → entities → shared`.
- **이 프로젝트에선**
  `src/app / views / widgets / features / entities / shared` 6개. 표준의 `pages` 자리에 `views`가 있다.
  `app/`은 라우팅 껍데기만 두고 화면 코드는 `views/`에 둔다. 40개 `page.tsx` 중 29개가 이렇게 5줄짜리다:
  ```tsx
  // src/app/(main)/home/page.tsx
  import HomeView from '@/views/home/ui/HomeView'
  export default function Page() {
    return <HomeView />
  }
  ```
  폴더명 규칙: 라우트 경로를 kebab-case로 평탄화. `/social/clubs/[id]` → `views/social-club-detail`.
  문서에 적힌 이유(ARCHITECTURE.md): "라우팅과 화면 로직을 섞으면 라우트 변경이 화면 코드를 흔든다."
- **말로 하는 답변**
  "FSD를 기본으로 하되 Next.js App Router에 맞게 바꿨어요. App Router는 `app/` 아래 파일 위치가 곧 URL이라서, 거기에 화면 코드를 두면 라우트를 옮길 때마다 화면 코드도 같이 흔들려요. 그래서 `app/*/page.tsx`는 views 컴포넌트를 렌더링만 하고, 실제 화면은 `views/` 레이어에 뒀어요. 이름을 `pages`로 하지 않은 건 Next.js에서 `pages/` 폴더가 Pages Router 예약어라 헷갈리기 때문이에요. 나머지는 FSD 그대로예요. 위젯은 여러 기능을 조립한 블록, features는 사용자 행동 단위, entities는 도메인 데이터, shared는 북작인지 몰라도 쓸 수 있는 것들이요."
  (※ "pages가 Next.js 예약어" 부분은 일반 지식이고, 이 레포 문서에는 적혀 있지 않다. 문서에 적힌 이유는 "라우트 변경에 화면이 흔들리지 않게"다.)
- **꼬리 질문**
  1. *"import 방향 규칙을 도구로 강제하나요?"* → **아니다.** `eslint.config.mjs`는 `eslint-config-next` 기본만 쓴다. 경계 규칙(`eslint-plugin-boundaries` 등)은 없다. 솔직히 "문서로만 정했고, 다음 단계는 lint로 강제하는 것"이라고 답하기.
  2. *"views끼리 import하나요?"* → 확인 결과 `views → app` import 없음, `features/widgets → views` import 없음. 즉 상위 방향 위반은 없다.
- **약점/주의**
  - **shared가 entities를 import하는 곳이 2개 있다** (FSD 위반): `src/shared/ui/TopActions.tsx:7` (알림 미읽음 카운트 import), `src/shared/config/currentUser.ts:2` (`getMyId` 재export).
  - **entities끼리 서로 import한다** (표준 FSD는 같은 레이어 간 import 금지): `post → person`, `club → person`, `book-rating → user`, `person → reading-type`, `profile-report → book-rating, reading-type`, `recommendation → post`.
  - 면접관이 찌르면: "레이어 방향은 지켰지만 slice 간 격리는 못 지켰다. 특히 shared→entities 두 곳은 알고 있고, `TopActions`는 widgets로 내려야 맞다"라고 인정하는 편이 낫다.

---

### Q2. 상태 관리는 어떻게 했나요? Zustand는 어디에 썼나요?

- **근거 파일**: `CLAUDE.md`(상태 관리 기준선), `src/shared/lib/toast.ts`, `src/features/quiz-test/model/testStore.ts`, `src/entities/user/model/profile.ts`, `src/features/wishlist/model/wishlist.ts`
- **기본 개념**
  React 상태는 기본적으로 컴포넌트 안에 갇혀 있다. 여러 컴포넌트가 같은 값을 보고 **함께 다시 그려져야** 하면 "전역 상태"가 필요하고, zustand는 그걸 가볍게 만드는 라이브러리다 (방송국 비유: 하나가 바뀌면 구독자 전부에게 알림).
  반대로 "저장해 두고 필요할 때 꺼내 보기만" 하는 값은 방송이 필요 없다. 그냥 함수로 읽고 쓰면 된다. 이 프로젝트는 그 둘을 나눴다.
- **이 프로젝트에선**
  zustand 스토어는 **딱 2개**:
  | 스토어 | 파일 | 쓰는 곳 |
  |---|---|---|
  | `useToastStore` | `src/shared/lib/toast.ts` | `shared/ui/Toast.tsx`가 구독. 화면들은 `toast.error()` 헬퍼로 호출(31곳) |
  | `useTestStore` | `src/features/quiz-test/model/testStore.ts` | `TestView`, `TestLoadingView`, `ResultDetailView`, `ResultCompareView` |
  ```ts
  // testStore.ts — 12문항 진행 상태. 마지막 답에서 채점·저장까지 한 번에
  selectAnswer: (answer) => {
    const isComplete = currentStep >= 11
    set({ answers: newAnswers, currentStep: isComplete ? 11 : currentStep + 1, isComplete })
    if (isComplete) {
      const result = scoreTest(newAnswers)
      saveResult(result)                       // localStorage
      saveTypeCode(result.typeCode).catch(() => {})  // 로그인 상태면 서버 백업
      set({ result })
    }
  }
  ```
  localStorage 순수 함수 패턴 (`entities/*/model/*.ts`): `getNickname/setNickname`, `loadResult/saveResult`, `loadWishlist/addToWishlist`, `loadBookRatings/saveBookRating`, `recordActivity/getActivityScore`. 전부 `if (typeof window === 'undefined') return` 가드 + `try/catch` 형태.
  그 외 **모듈 변수 Set 캐시**도 있다: `features/follow/model/follows.ts`의 `followingIds`, `entities/club/model/clubActions.ts`의 `joinedIds` (화면이 동기로 "팔로우했나?"를 물어야 해서 메모리에 들고 있음).
- **말로 하는 답변**
  "zustand는 두 군데만 썼어요. 토스트는 어느 화면에서든 띄우고 한 곳에서 그려야 하니까 전역이 맞고, 유형 테스트는 문항 화면·로딩 화면·결과 화면 세 개가 같은 답변 배열을 보면서 진행돼서 전역이 필요했어요. 나머지 닉네임, 찜, 별점 같은 건 '저장하고 꺼내 보는' 성격이라 `entities/*/model`에 순수 함수로 두고 localStorage에 읽고 썼어요. 기준은 CLAUDE.md에 적어뒀는데, '여러 컴포넌트가 구독하고 함께 리렌더링돼야 하는가'예요. 그게 아니면 스토어를 만들지 않아요."
- **꼬리 질문**
  1. *"localStorage 값이 바뀌면 화면이 자동으로 바뀌나요?"* → 아니다. 순수 함수라 구독이 없다. 화면이 마운트 때 읽거나, 토큰처럼 바뀌어야 할 때는 `window.dispatchEvent(new Event(TOKENS_CHANGED))` 같은 커스텀 이벤트로 알린다(`AuthProvider.tsx`). 이게 한계라고 인정.
  2. *"테스트 결과를 왜 zustand에도 두고 localStorage에도 두나요?"* → zustand는 진행 중(메모리), localStorage는 완료 후 보존(새로고침·재방문). 역할이 다르다.
- **약점/주의**
  - CLAUDE.md 예시에 `getLikedIds`가 적혀 있는데, **현재 코드에 그 이름의 함수는 확인 못 함.** 좋아요 목록은 `postsRemote.ts`가 서버 `likes` 테이블에서 바로 만든다(50~56행). 문서 예시가 낡았다.
  - zustand 스토어에 `persist` 미들웨어를 안 썼으므로 테스트 중 새로고침하면 진행이 날아간다.

---

### Q3. 좋아요·위시리스트·닉네임·별점은 DB에 저장되나요, localStorage에만 있나요?

- **근거 파일**: `src/entities/post/api/postsRemote.ts`, `src/features/wishlist/{model,api}`, `src/entities/book-rating/{model,api}`, `src/entities/user/model/profile.ts`, `src/widgets/auth-provider/AuthProvider.tsx`, `src/entities/reading-type/model/scoring.ts`, `src/shared/lib/activity.ts`
- **기본 개념**
  localStorage는 "이 브라우저의 서랍". 기기를 바꾸면 비어 있고, 사용자가 지우면 사라진다. DB는 "계정의 금고". 둘 다 쓰면 **원본이 어디인지**와 **어긋났을 때 누가 이기는지**를 정해야 한다.
- **이 프로젝트에선** (하나씩 확인)
  | 데이터 | 원본 | localStorage | 비고 |
  |---|---|---|---|
  | 좋아요 | **DB만** (`likes` 테이블) | 없음 | `postsRemote.ts` 1행 주석 "서버가 유일한 소스. localStorage 폴백 없음". `like_count`는 트리거가 맞춤 |
  | 댓글·글·팔로우·모임 | **DB만** | 없음 (팔로우·가입은 메모리 Set) | |
  | 위시리스트(내 서재) | **DB** (`wishlist`) | **사본** | `syncWishlist()`가 `book_wishlist_synced_at` 기준으로 병합. 로그인 필수 |
  | 별점·리뷰 | **DB** (`ratings`) | **사본** | `syncMyRatings()`가 `updated_at` vs 로컬 `ts` 비교, 최근 값이 이김 |
  | 닉네임·아바타 | **DB** (`profiles`) | **캐시** | `AuthProvider`가 로그인 후 `fetchProfile()` → `setNickname()`으로 채움 |
  | 독서 유형 | DB는 `profiles.type_code` **코드만** | **전체 결과**(축 점수·스탯·배지 후보) | `restoreResult()`는 코드로 기본 스탯만 복원. 축 점수·배지는 복원 불가(주석에 명시) |
  | 활동 점수 | **localStorage만** | ✔ | `activity.ts` 주석: "localStorage 임시" |
  | 옛 블라인드 평가 | **localStorage만** (레거시) | ✔ | `blindRatings.ts` "새로 쌓이지 않음" |
  | 블라인드 반응·토큰 | **DB만** | 없음 | `/api/blind/today` 라우트 경유, `token_ledger` 원장 |
  유형 동기화 방향(서버 우선):
  ```ts
  // AuthProvider.tsx
  function syncTypeCode(serverCode: string | null) {
    const local = loadResult()?.typeCode
    if (serverCode) { if (local !== serverCode) restoreResult(serverCode) }
    else if (local) { saveTypeCode(local).catch(() => {}) }
  }
  ```
  주석 이유: "로컬 우선으로 하면 공용 기기에서 앞사람 결과가 다음 사람 계정을 덮는다."
- **말로 하는 답변**
  "쓰기 데이터는 전부 Supabase가 원본이에요. 좋아요·글·댓글·팔로우는 DB만 쓰고요. 찜이랑 별점은 DB가 원본이지만 마이페이지처럼 화면이 동기로 바로 읽어야 하는 곳이 있어서 localStorage에 사본을 두고, 로그인하면 sync 함수가 서버와 병합해요. 별점은 더 최근 값이 이기고, 유형은 공용 기기 문제 때문에 서버 값을 우선해요. 비로그인으로 테스트한 결과는 첫 로그인 때 서버로 올라가요."
- **꼬리 질문**
  1. *"비로그인 사용자는 찜을 할 수 있나요?"* → `addToWishlist`는 로컬에 먼저 넣고 `pushWishlist`는 비로그인이면 throw하는데 `.catch(() => {})`로 삼킨다. 즉 로컬에는 담기고, 나중에 로그인 시 `syncWishlist`가 올린다.
  2. *"다른 기기에서 뺀 찜은 어떻게 처리하나요?"* → `syncWishlist`: 서버에 없고 마지막 sync 이전에 담은 로컬 항목은 "다른 기기에서 뺀 것"으로 보고 버린다.
- **약점/주의**
  - 활동 점수가 localStorage에만 있어 기기 바꾸면 0점. "임시"라고 주석에 적혀 있다.
  - 독서 유형의 축 점수·배지 후보는 서버에 없다. 새 기기에서는 기본 스탯만 보인다.

---

### Q4. Supabase 클라이언트를 브라우저용·서버용으로 나눈 이유는? 레거시 클라이언트는요?

- **근거 파일**: `src/shared/api/supabase-browser.ts`, `src/shared/api/supabase-server.ts`, `CLAUDE.md`, 커밋 `abc049b`
- **기본 개념**
  Supabase 로그인 세션은 **쿠키**에 들어 있다. 브라우저에서는 `document.cookie`로 자동 처리되지만, 서버(서버 컴포넌트·라우트 핸들러)에서는 **요청에 실린 쿠키를 직접 꺼내 줘야** 한다. 그래서 `@supabase/ssr`은 `createBrowserClient`와 `createServerClient`를 따로 준다. 같은 열쇠(anon key)를 쓰지만 "열쇠를 어디서 꺼내느냐"가 다르다.
- **이 프로젝트에선**
  ```ts
  // supabase-browser.ts
  export function createSupabaseBrowser() {
    return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  // supabase-server.ts
  export async function createSupabaseServer() {
    const cookieStore = await cookies()           // next/headers — 서버에서만 가능
    return createServerClient(url, key, { cookies: { getAll() {...}, setAll(...) {...} } })
  }
  ```
  사용처: 브라우저용은 24개 파일(모든 `*Remote.ts`, `useAuthGate`, `AuthProvider`). 서버용 헬퍼는 **`src/app/api/blind/today/route.ts`에서만** 쓴다. `src/proxy.ts`와 `src/app/auth/callback/route.ts`는 헬퍼를 안 쓰고 `createServerClient`를 직접 만든다(요청/응답 쿠키를 다르게 다뤄야 해서).
  **레거시 클라이언트**: 최초 커밋에 `src/shared/api/supabase.ts`(`getSupabase()`, 순수 `supabase-js`의 `createClient`)가 있었고 CLAUDE.md에 "레거시. 신규 코드에서 쓰지 않는다"로 적혀 있었다. 커밋 `abc049b`("레거시 클라이언트와 낡은 문서 정리")에서 **삭제**됐다. 지금은 2개만 있다.
- **말로 하는 답변**
  "Supabase 세션이 쿠키에 있어서, 브라우저는 `createBrowserClient`로 자동 처리되고 서버는 `next/headers`의 `cookies()`로 요청 쿠키를 꺼내서 `createServerClient`에 넘겨야 해요. 그래서 `shared/api`에 둘을 분리해 두고, CLAUDE.md에 '클라이언트 컴포넌트는 browser, 서버 컴포넌트·라우트 핸들러는 server'라고 못 박았어요. 처음엔 `supabase-js`의 `createClient`로 만든 클라이언트가 하나 더 있었는데, 쿠키 세션과 안 맞아서 레거시로 표시했다가 완전히 지웠어요."
- **꼬리 질문**
  1. *"서버용을 왜 한 군데서만 쓰나요?"* → 데이터 로딩이 거의 클라이언트 컴포넌트의 `useEffect`에서 일어나기 때문(Q7 참고). 서버 라우트는 블라인드 북(공개 전 제목 숨김)처럼 "클라이언트에 보내면 안 되는 것"이 있을 때만 썼다.
  2. *"anon key가 브라우저에 노출돼도 되나요?"* → 설계상 공개 키다. 권한은 RLS가 막는다(Q5). `LAUNCH.md`에도 "공개 (RLS로 보호되는 키)"로 적혀 있다.
- **약점/주의**
  - `tryRemote()`(3초 타임아웃 래퍼)가 `supabase-browser.ts`에 정의돼 있지만 **호출하는 곳이 0곳**이다. `docs/TROUBLESHOOTING.md`에는 "원격 호출을 전부 감쌌다"고 적혀 있어 문서와 코드가 어긋난다. 면접관이 이걸 열어 보면 바로 보인다. "래퍼를 만들었지만 적용을 못 끝냈다"고 솔직하게.

---

### Q5. 카카오 로그인 흐름을 설명해 주세요. RLS는 설정했나요?

- **근거 파일**: `src/views/login/ui/LoginView.tsx`, `src/app/auth/callback/route.ts`, `src/proxy.ts`, `src/widgets/auth-provider/AuthProvider.tsx`, `supabase/schema.sql`, `supabase/migrations/0023_protect_counters.sql`, `0014_tokens.sql`, `0025_lock_notify_rpc.sql`, `scripts/rls-check.mjs`
- **기본 개념**
  - **OAuth**: 우리 서비스가 비밀번호를 받지 않고 카카오에 "이 사람 맞아?"를 묻는 방식. 카카오가 확인 후 일회용 `code`를 돌려주고, 우리는 그 code를 세션으로 바꾼다(PKCE 방식).
  - **RLS(Row Level Security)**: DB 테이블에 "이 행은 누가 읽고 쓸 수 있나"를 SQL로 적는 것. 앱 코드가 아니라 **DB가 문지기**라서, 브라우저에서 API를 직접 때려도 남의 데이터를 못 건드린다.
- **이 프로젝트에선**
  로그인 흐름 (4단계):
  1. `LoginView` → `sb.auth.signInWithOAuth({ provider: 'kakao', redirectTo: origin + '/auth/callback?next=...' })`
  2. 카카오 → Supabase 콜백 → 우리 `/auth/callback`에 `?code=` 도착
  3. `route.ts`: `supabase.auth.exchangeCodeForSession(code)` → 쿠키에 세션 저장 → `next`로 리다이렉트. 실패 시 `/login?error=auth`
  4. `src/proxy.ts`(Next 16에서 `middleware.ts`가 `proxy.ts`로 바뀜): 매 요청마다 `auth.getUser()`로 세션 갱신. 로그인한 사용자가 `/login`에 오면 `/home`으로. **로그인 강제 리다이렉트는 없음**(주석: 모든 페이지 비로그인 열람 가능, 쓰기 동작에서 게이트).
  5. 클라이언트 `AuthProvider`: 마운트 시 `getUser()` → 프로필 없으면 닉네임 시트, 있으면 로컬 캐시 채우기 + 출석 토큰.
  RLS: `schema.sql`에서 13개 테이블 `enable row level security`, 마이그레이션에서 `wishlist`, `token_ledger` 등 추가. 정책 패턴:
  ```sql
  create policy "posts: 누구나 조회" on public.posts for select using (true);
  create policy "posts: 본인만 등록" on public.posts for insert to authenticated with check (auth.uid() = author_id);
  create policy "posts: 본인만 수정" on public.posts for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
  ```
  `blind_reactions`·`wishlist`는 select도 본인만. 집계 컬럼(`like_count`, `member_count`)은 `0023`의 `tg_keep_counters` 트리거가 `pg_trigger_depth() > 1`이 아니면 옛 값으로 되돌려 직접 수정을 막는다. 토큰 차감은 `reveal_blind()` 함수가 `pg_advisory_xact_lock`으로 잠그고 원자적으로 처리. `notify()` RPC는 `0025`에서 API 역할 실행 권한을 걷었다. `pnpm rls:check`(`scripts/rls-check.mjs`)가 가상 사용자 A·B로 남의 글 수정 등을 시도하고 롤백한다.
- **말로 하는 답변**
  "카카오 로그인은 Supabase Auth의 OAuth를 썼어요. 로그인 버튼이 `signInWithOAuth`를 부르면 카카오를 거쳐 `/auth/callback`으로 code가 오고, 라우트 핸들러에서 `exchangeCodeForSession`으로 세션을 쿠키에 넣어요. `proxy.ts`에서 매 요청마다 `getUser()`로 세션을 갱신하는데, `getSession()`이 아니라 `getUser()`를 쓴 건 서버에서 토큰을 실제로 검증하기 때문이에요. 권한은 RLS로 DB에서 막았어요. 모든 테이블에 '누구나 조회, 본인만 쓰기' 정책을 걸었고, 좋아요 수 같은 집계 컬럼은 트리거만 바꿀 수 있게 했어요. 정책이 실제로 막는지는 `rls:check` 스크립트로 확인해요."
- **꼬리 질문**
  1. *"`getUser()`와 `getSession()` 차이?"* → `getSession()`은 쿠키의 JWT를 믿고 돌려주고, `getUser()`는 Supabase 서버에 물어 검증한다. `proxy.ts` 주석에 그 이유가 적혀 있다. `useAuthGate.ts`는 클라이언트라 `getSession()`을 쓴다(UI 게이트 용도).
  2. *"RLS 정책 바꾸면 어떻게 검증하나요?"* → `rls:check`에 시나리오를 추가한다. `TROUBLESHOOTING.md`에 "프로젝트 복구 후 GRANT가 사라졌는데 스크립트가 '정책 위반'이 아니라 'permission denied'를 출력해 구분할 수 있었다"는 사례가 있다.
- **약점/주의**
  - `proxy.ts`가 **모든 요청**(정적 파일 제외)에서 Supabase에 `getUser()`를 호출한다. 비로그인 방문자에게도 네트워크 왕복이 생긴다. 성능 질문이 오면 인정.
  - `docs/TROUBLESHOOTING.md`가 인용한 커밋 해시 17개 중 **8개가 이 레포에 없다** (`22a7229`, `fb2ff75`, `33dd039`, `3753052`, `a417f05`, `723b9ce`, `499aa82`, `ceb452a`, `355e77f`). 히스토리를 정리하면서 해시가 바뀐 것으로 보인다. 면접관이 README의 링크를 누르면 404가 뜬다. 미리 알고 있을 것.

---

### Q6. 알라딘 도서 API를 왜 서버 라우트로 프록시했나요? `NEXT_PUBLIC_` 규칙은?

- **근거 파일**: `src/app/api/aladdin/aladdinApi.ts`, `src/app/api/aladdin/{list,search,lookup}/route.ts`, `.env.example`, `docs/LAUNCH.md`
- **기본 개념**
  브라우저에서 외부 API를 직접 부르면 **API 키가 네트워크 탭에 그대로 보인다**. Next.js는 `NEXT_PUBLIC_` 접두사가 붙은 환경변수만 브라우저 번들에 넣고, 나머지는 서버에서만 읽을 수 있다. 그래서 키가 필요한 호출은 우리 서버(라우트 핸들러)를 "대리인"으로 세운다. 프록시 = 대리인.
- **이 프로젝트에선**
  ```ts
  // aladdinApi.ts
  const key = process.env.ALADDIN_TTB_KEY            // NEXT_PUBLIC_ 없음 → 서버 전용
  const revalidate = endpoint === 'ItemLookUp' ? 86400 : 3600
  res = await fetch(`https://www.aladin.co.kr/ttb/api/${endpoint}.aspx?${sp}`, { next: { revalidate } })
  ```
  - 라우트 3개: `/api/aladdin/list`(베스트셀러 등), `/search?q=`(키워드), `/lookup?isbn13=`(한 권 상세).
  - 응답을 `AladdinBook` 타입으로 **정규화**하고 HTML 엔티티(`&lt;` 등)를 푼다.
  - 실패는 전부 502 + 한국어 메시지. `errorCode === 8`(없음)은 에러가 아니라 빈 배열.
  - 캐시: 알라딘 일 5,000회 한도 때문에 `next.revalidate`로 한 권 정보 하루, 목록·검색 1시간 재사용(주석에 명시).
  - `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`는 공개, `ALADDIN_TTB_KEY`는 서버 전용. `LAUNCH.md`: "`NEXT_PUBLIC_` 접두사를 절대 붙이지 않는다. 붙이면 브라우저 번들에 노출된다."
- **말로 하는 답변**
  "알라딘 TTB 키를 브라우저에 두면 누구나 가져다 쓸 수 있어서 라우트 핸들러 세 개로 프록시했어요. 키는 `NEXT_PUBLIC_` 없이 서버 환경변수로만 두고요. 덤으로 알라딘 응답이 지저분해서, 서버에서 필드를 정규화하고 HTML 엔티티를 풀어서 화면은 깨끗한 타입만 받게 했어요. 일 호출 한도가 있어서 `fetch`의 `revalidate`로 서버 캐시도 걸었어요."
- **꼬리 질문**
  1. *"Supabase 키는 왜 `NEXT_PUBLIC_`인가요?"* → anon key는 설계상 공개 키이고 RLS가 권한을 막는다. 알라딘 키는 권한 체계가 없어서 숨겨야 한다.
  2. *"프록시 라우트를 아무나 호출하면 우리 쿼터를 소진하지 않나요?"* → 맞다. 현재 라우트에 인증·rate limit은 없다(확인). 캐시가 완충 역할을 할 뿐. 개선점으로 말하기.
- **약점/주의**
  - 위 2번. 공개 라우트라 남용 가능.
  - 지원서에 "카카오 도서 API"라고 썼다면 **정정** 필요(0장).

---

### Q7. 서버 컴포넌트와 클라이언트 컴포넌트를 어떤 기준으로 나눴나요?

- **근거 파일**: `src/app/**/page.tsx`(대부분 `'use client'` 없음), `src/views/**/*View.tsx`(39개 중 38개 `'use client'`), `src/app/(public)/result/[typeCode]/page.tsx`, `src/app/(main)/layout.tsx`
- **기본 개념**
  App Router에서 컴포넌트는 기본이 **서버 컴포넌트**(서버에서 HTML로 만들어 보냄, JS 번들에 안 들어감, `useState`·`onClick`·`localStorage` 못 씀). 파일 맨 위에 `'use client'`를 쓰면 **클라이언트 컴포넌트**(브라우저에서 실행, 훅·이벤트 가능). 클라이언트 컴포넌트가 import하는 자식은 자동으로 클라이언트가 된다.
- **이 프로젝트에선**
  - `app/*/page.tsx`와 `layout.tsx`는 **서버 컴포넌트**. 여기서 `generateMetadata`(결과·궁합 페이지의 OG 제목), `opengraph-image.tsx`(next/og), `redirect`, `notFound` 처리.
  - `views/*View.tsx`는 **거의 전부 클라이언트**(38/39). 이유는 코드에서 확인된다: localStorage 읽기(`loadResult`), `useEffect`로 Supabase 브라우저 호출, 무한스크롤 `IntersectionObserver`, `html-to-image`.
  - 유일하게 `'use client'`가 없는 뷰 파일 `HomeHero.tsx`는 훅이 없는 순수 표현 컴포넌트이고, 클라이언트인 `HomeView`가 import하므로 결과적으로 클라이언트로 동작한다.
  - 동적 파라미터는 서버 page가 `params`(Next 16에서 `Promise`)를 받아 뷰에 넘기고, 뷰가 `useEffect` 안에서 `params.then(...)`으로 푼다(`ResultDetailView.tsx:106`).
  - 라우트 그룹: `(main)` 레이아웃에는 `AuthProvider + TopActions + BottomNav + Toast`, `(public)` 레이아웃(테스트·결과·로그인·궁합)에는 `AuthProvider + Toast`만.
- **말로 하는 답변**
  "경계는 `app/`과 `views/` 사이에 뒀어요. `page.tsx`는 서버 컴포넌트로 두고 메타데이터·OG 이미지·리다이렉트처럼 서버에서 해야 하는 일만 하고, 화면은 views에서 `'use client'`로 열어요. 화면 대부분이 localStorage를 읽거나 Supabase를 브라우저에서 호출하고 무한스크롤 같은 상호작용이 있어서, 서버 컴포넌트로 두면 얻는 게 적다고 판단했어요. 대신 결과 페이지의 OG 메타데이터나 블라인드 북처럼 클라이언트에 노출하면 안 되는 로직은 서버 쪽에 뒀어요."
- **꼬리 질문**
  1. *"그럼 서버 컴포넌트의 장점(번들 축소, 서버 데이터 페칭)을 거의 못 쓴 것 아닌가요?"* → 맞다. `TROUBLESHOOTING.md`도 "LCP 5초대, 남은 원인은 JS 번들… 홈의 클라이언트 컴포넌트 범위를 줄인다"를 다음 단계로 적었다. 솔직하게 "지금은 거의 SPA에 가깝다"고 인정하고, 개선 방향(피드 첫 페이지를 서버에서 가져와 props로 넘기기)을 말하기.
  2. *"서버 컴포넌트에서 Supabase를 쓰려면?"* → `createSupabaseServer()`(Q4). 지금은 `/api/blind/today`에서만 쓴다.
- **약점/주의**
  - 데이터 페칭이 전부 클라이언트 `useEffect`. 서버 렌더 시 피드는 비어 있다(SEO·LCP 손해).
  - 이 점을 모르고 "서버 컴포넌트를 적극 활용했다"고 말하면 위험.

---

### Q8. Next.js에서 localStorage를 쓸 때 뭘 조심했나요? (서버 실행, 하이드레이션)

- **근거 파일**: `src/shared/lib/useMounted.ts`, `src/entities/user/model/profile.ts`, `src/views/home/ui/HomeView.tsx:60-62`, `docs/TROUBLESHOOTING.md`(set-state-in-effect 항목)
- **기본 개념**
  - **서버 실행**: Next.js는 클라이언트 컴포넌트도 **서버에서 한 번 먼저 렌더**한다. 서버에는 `window`·`localStorage`가 없어서 그냥 부르면 터진다.
  - **하이드레이션**: 서버가 만든 HTML 위에 브라우저가 React를 "덧입히는" 과정. 서버 HTML과 브라우저 첫 렌더 결과가 **다르면 경고/깨짐**. localStorage 값은 서버에 없으니 첫 렌더에서 읽으면 둘이 달라진다. 비유: 설계도(서버 HTML)와 실제 건물(클라이언트 첫 렌더)이 다르면 공사가 멈춘다.
- **이 프로젝트에선**
  1. 모든 model 함수에 가드:
     ```ts
     export function getNickname(): string | null {
       if (typeof window === 'undefined') return null
       return localStorage.getItem(STORAGE_KEY)
     }
     ```
  2. 하이드레이션 어긋남 방지 훅:
     ```ts
     // useMounted.ts — 서버·첫 렌더에서 false, 마운트 후 true
     export function useMounted(): boolean {
       return useSyncExternalStore(subscribe, () => true, () => false)
     }
     // HomeView.tsx
     const mounted = useMounted()
     const typeCode = useMemo(() => (mounted ? loadResult()?.typeCode ?? null : null), [mounted])
     ```
     8개 파일에서 사용. 주석: "useEffect + setState로 늦게 채우면 렌더가 한 번 더 도는데, 이 훅으로 분기하면 렌더 중에 바로 파생시킬 수 있다."
  3. `TROUBLESHOOTING.md`: React 19의 `set-state-in-effect` lint 오류 20건을 이 패턴으로 제거(규칙을 끄지 않음).
  4. 읽기 실패(사파리 시크릿 모드 등)는 `try/catch`로 삼킴 (`HomeView.getFollowingSeen`).
- **말로 하는 답변**
  "두 가지를 조심했어요. 첫째, 클라이언트 컴포넌트도 서버에서 한 번 렌더되니까 localStorage를 읽는 함수마다 `typeof window === 'undefined'` 가드를 넣었어요. 둘째, 하이드레이션인데, 첫 렌더에서 localStorage 값을 바로 쓰면 서버 HTML과 달라져서 깨져요. 처음엔 `useEffect`에서 `setState`로 늦게 채웠는데 React 19 lint가 `set-state-in-effect`로 20건을 잡았어요. 그래서 `useSyncExternalStore`로 '마운트됐는지'만 알려주는 `useMounted` 훅을 만들고, 마운트 전엔 null, 후엔 localStorage 값을 렌더 중에 바로 파생시키는 식으로 바꿨어요."
- **꼬리 질문**
  1. *"`useSyncExternalStore`를 왜 썼나요? `useEffect`로 `setMounted(true)`하면 되지 않나요?"* → 그게 바로 lint가 잡는 패턴(effect 안 setState)이고 렌더가 한 번 더 돈다. `useSyncExternalStore`는 서버 스냅샷(false)과 클라이언트 스냅샷(true)을 React가 공식적으로 구분해 주는 API라 하이드레이션 불일치 경고 없이 동작한다.
  2. *"마운트 전엔 뭐가 보이나요?"* → `typeCode`가 null이라 "테스트 시작" CTA가 보이고, 마운트 후 결과가 있으면 "내 유형 카드 보기"로 바뀐다(`HomeHero`). 깜빡임이 있을 수 있다고 인정.
- **약점/주의**
  - `useMounted`가 true가 되는 순간 한 번 더 렌더되므로 "렌더 1회 절약"은 정확히는 "effect→setState 체인 제거"다.

---

### Q9. 독서 유형 테스트 점수는 어떻게 계산하나요?

- **근거 파일**: `src/entities/reading-type/model/scoring.ts`, `questions.ts`, `readingTypes.ts`, `readingType.test.ts`
- **기본 개념**
  MBTI처럼 4개 축(F/T, I/C, E/G, R/W) 각각에서 "어느 쪽 답이 많았나"를 세어 글자 4개를 뽑는다. 거기에 유형별 기본 능력치에 "얼마나 한쪽으로 쏠렸나"를 더해 개인별 스탯을 만든다.
- **이 프로젝트에선**
  - 12문항, 축당 3문항. 각 답은 `value: 'F' | 'T' | ...`.
  - `calcAxisScores`: 축별로 카운트. `determineType`: 다수결, **동점이면 앞 글자**(F·I·E·R).
    ```ts
    const f1 = scores.FT.F >= scores.FT.T ? 'F' : 'T'
    ```
  - `calcVariantStats`: 스탯 5종(몰입력·인내심·감수성·허세력·완독력). 공식 `base + Σ(축 편중 가중치)`. 3:0 → ±6, 2:1 → ±3, 동점 → 0. 최종 10~99로 clamp.
    ```ts
    const diff = posVal - negVal   // -3 ~ +3
    if (diff >= 3) return 6
    if (diff >= 1) return 3
    ...
    result[stat] = Math.min(99, Math.max(10, base[stat] + delta))
    ```
  - 4지선다 문항의 C·D 선택지에 `badgeKey`가 붙어 있고 `collectBadges`가 모은다 → 배지 후보.
  - 테스트(`readingType.test.ts`): "축별 다수결", "동점이면 앞쪽 값", "10~99 clamp", "16유형 데이터 존재" 등. 직접 실행해 통과 확인.
- **말로 하는 답변**
  "순수 함수 `scoreTest` 하나예요. 12문항을 축별로 세서 다수결로 글자 4개를 정하고, 동점이면 앞 글자를 택해요. 그 다음 유형별 기본 스탯에 축 쏠림 정도를 더해요. 3대0이면 ±6, 2대1이면 ±3, 그리고 10에서 99 사이로 자르고요. 이 함수는 React를 전혀 모르는 순수 함수라 Vitest로 테스트를 붙였고, CI에서 돌아가요."
- **꼬리 질문**
  1. *"동점이 왜 앞 글자인가요?"* → 축당 3문항이라 3개 다 답하면 동점이 안 난다. 빈 답(테스트 중단) 방어용. 테스트 케이스 `scoreTest([]) → 'FIER'`가 그걸 고정한다.
  2. *"희소도 %는 어디서 왔나요?"* → `PRD.md`: F/T·R/W·E/G축은 2025 국민독서실태조사 비율, I/C축은 근거가 없어 50:50, 그룹 내 세부 %는 임의. 솔직하게 말하기.
- **약점/주의**
  - 스탯이 `readingTypes.ts`의 하드코딩된 `baseStats`에 의존. "허세력" 가중치 주석에 `TT(T+)`라는 오타성 표기가 있다(실제 맵은 `FT`에 `T`).
  - `readingTypes.ts`의 `accent`·`habitatColors` 필드(hex 32개)는 **어디서도 사용하지 않는 죽은 데이터**다.

---

### Q10. 블라인드 북 "날짜 시드 셔플"은 어떻게 동작하나요?

- **근거 파일**: `src/entities/blind-book/model/blindBooks.ts`, `src/app/api/blind/today/route.ts`, `blindBooks.test.ts`
- **기본 개념**
  `Math.random()`은 매번 다르다. "모든 사용자가 같은 날 같은 5권"을 보려면 **같은 입력(날짜)에 항상 같은 순서**가 나와야 한다. 그래서 날짜 문자열을 숫자(시드)로 바꾸고, 그 시드로 시작하는 **가짜 난수 생성기(LCG)** 로 섞는다. 비유: 같은 번호로 시작하는 복권 추첨기는 항상 같은 순서로 공이 나온다.
- **이 프로젝트에선**
  ```ts
  function seedOf(key: string): number {           // 문자열 → 정수 (×31 해시)
    let seed = 0
    for (let i = 0; i < key.length; i++) seed = (seed * 31 + key.charCodeAt(i)) | 0
    return Math.abs(seed)
  }
  export function seededShuffle<T>(arr: T[], key: string): T[] {   // Fisher–Yates + LCG
    let seed = seedOf(key)
    const out = [...arr]
    for (let i = out.length - 1; i > 0; i--) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      const j = seed % (i + 1)
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    return out
  }
  export function kstDateKey(now = Date.now()): string {
    return new Date(now + 9 * 3600_000).toISOString().slice(0, 10)   // KST 'YYYY-MM-DD'
  }
  ```
  서버 라우트 흐름: KST 날짜 → 요일별 테마(일·토 "이것저것", 월 소설, 화 에세이…) → 알라딘 지난주 베스트셀러 + 주목 신간 → `pickDailyBlindBooks`(세트 제외, 제목이 소개에 그대로 있으면 제외, 저자명 `○○○` 가림, `makeBlurb`로 1~2문장) → `seededShuffle(pool, dateKey).slice(0, 5)`. `unstable_cache`로 **날짜를 키로 하루 캐시**(`revalidate: 86400`, 태그 `blind-daily-v2`). 공개 전 제목은 **클라이언트로 내려가지 않는다**(GET 응답은 `status === 'revealed'`일 때만 `book` 포함).
- **말로 하는 답변**
  "같은 날이면 모두 같은 5권이어야 해서 날짜 문자열을 시드로 쓰는 결정적 셔플을 만들었어요. 문자열을 31배수 해시로 정수로 만들고, LCG로 난수를 뽑아 Fisher-Yates로 섞어요. 날짜는 KST 기준이라 UTC 시각에 9시간을 더해 자릅니다. 이 선정·가림 처리는 전부 서버 라우트에서 하고 `unstable_cache`로 하루 캐시해요. 공개 전 제목이 클라이언트로 안 내려가게 하려고 서버에서만 처리했어요. 순수 함수라 테스트도 붙였어요."
- **꼬리 질문**
  1. *"입력 목록이 바뀌면 같은 날인데 결과가 달라지지 않나요?"* → 맞다. 코드 주석에 "신간 목록은 주 단위로 바뀌어 주 경계에서 같은 날 목록이 갈릴 수 있다. 문제가 되면 결과를 DB에 박아 고정한다"고 적혀 있다. 베스트셀러는 지난주(확정) 목록을 써서 완화.
  2. *"자정 넘긴 화면에서 공개 요청이 오면?"* → POST가 `body.date !== 오늘`이면 `409 STALE`을 돌려주고 클라이언트가 새로고침한다.
- **약점/주의**
  - `& 0x7fffffff` LCG는 품질이 낮은 난수지만 "섞는" 목적엔 충분. 암호학적 용도 아님을 알고 있을 것.
  - 캐시가 Vercel 서버리스 인스턴스마다 따로 데워질 수 있다(확인 못 함).

---

### Q11. 궁합(취향 유사도) 점수는 어떻게 계산하나요?

- **근거 파일**: `src/entities/reading-type/model/affinity.ts`, `src/features/people-match/model/peopleMatch.ts`, `src/app/(public)/match/[typeCode]/page.tsx`
- **이 프로젝트에선**
  ```ts
  export function calcAffinity(a: TypeCode, b: TypeCode): number {
    const typeA = READING_TYPES[a]
    if (typeA.compatibility.match === b) return 97      // 유형 데이터에 정의된 '찰떡'
    if (typeA.compatibility.opposite === b) return 18   // '정반대'
    const matches = a.split('').filter((c, i) => c === b[i]).length
    return 40 + matches * 15                            // 40 / 55 / 70 / 85 / 100(동일)
  }
  ```
  라벨: 90↑ "환상의 독서 파트너", 70↑ "꽤 잘 맞는 편", 50↑ "달라서 재밌는 사이", 그 아래 "정반대…".
  사람 찾기(`peopleMatch.ts`): 내 유형은 localStorage(`loadResult`), 상대 유형은 `profiles.type_code`, 궁합 내림차순 정렬 + 옛 블라인드 평가 태그 교집합.
  초대 링크: `/match/[typeCode]`가 서버에서 `generateMetadata`로 "○○ 친구가 독서 궁합을 보자고 해요" OG를 만들고, 친구가 테스트를 마치면 `?from=` 파라미터로 비교 화면으로 이어진다(`TestView.handleSelect`에서 `window.location.search` 전달).
- **말로 하는 답변**
  "유형 데이터에 각 유형마다 '찰떡'과 '정반대' 유형을 미리 정해 뒀어요. 그 둘이면 97점·18점을 고정으로 주고, 아니면 네 글자 중 몇 개가 같은지에 15점씩 얹어서 40~100점이 나와요. 단순하지만 설명 가능한 규칙이라 결과 카드에 그대로 보여줄 수 있어요. 테스트도 있어요."
- **꼬리 질문**: *"비대칭일 수 있나요?"* → A의 match가 B여도 B의 match가 A가 아닐 수 있다. `calcAffinity(a,b) !== calcAffinity(b,a)` 가능. 확인 못 함(데이터 전수 검사 안 함). "가능하다고 알고 있고, 현재는 '내 기준' 점수로 보여준다"고 답하기.
- **약점/주의**: 점수가 게임적 설계이지 통계 근거가 없다. 그렇게 말하면 된다.

---

### Q12. 디자인 토큰 구조(원시 vs 의미)와 `--color-control-surface` 상속을 설명해 주세요.

- **근거 파일**: `src/shared/styles/tokens.css`, `src/shared/styles/components.css:325-335`, `docs/DESIGN.md`
- **기본 개념**
  - **원시(primitive) 토큰**: 색 자체. `--p-orange-500: #F0562E`. "이 물감은 주황이다."
  - **의미(semantic) 토큰**: 역할. `--color-accent: var(--p-orange-500)`. "버튼 강조색은 저 물감을 쓴다."
    컴포넌트는 의미 토큰만 본다. 브랜드 색이 바뀌면 원시 1줄만 바꾸면 된다.
  - **CSS 변수 상속**: CSS 변수는 부모 → 자식으로 내려간다. 부모 요소에서 변수를 다시 정의하면 그 안의 자식은 새 값을 본다. 이걸로 "카드 안에 들어가면 칩 색이 자동으로 바뀌는" 효과를 만든다.
- **이 프로젝트에선**
  `tokens.css` 2단: `--p-*`(orange 5단계, ink 5단계, paper, white, riso 2색, red) → `--color-*`, `--font-*`, `--fs-*`, `--space-*`, `--radius-*`, `--elevation-floating`, `--app-width`.
  ```css
  /* tokens.css — 기본값 화이트 */
  --color-control-surface: var(--p-white);

  /* components.css:325 — 화이트 면 컨테이너 안에서는 크림으로 */
  .bj-card, .bj-question, .bj-row, .bj-sheet, .bj-typecard,
  .bj-post-card, .bj-event-card, .bj-blind-card, .bj-empty-card {
    --color-control-surface: var(--color-bg);
  }
  /* 칩·인풋은 이 토큰만 본다 */
  .bj-chip { background: var(--color-control-surface); }
  ```
  규칙(DESIGN.md): "컨트롤은 담긴 면과 항상 한 단 달라야 한다. 호출부가 배경을 신경 쓰지 않도록 토큰이 상속으로 처리한다."
  접근성 토큰: `--color-accent-text`(`#BD320E`)는 작은 주황 글자 전용, 화이트·크림·눌린 면 위 4.5:1 이상(WCAG AA). `TROUBLESHOOTING.md`에 42곳 교체 기록.
- **말로 하는 답변**
  "토큰은 두 단이에요. 원시 토큰 `--p-*`는 hex 값 그 자체고, 의미 토큰 `--color-accent` 같은 건 역할이에요. 컴포넌트는 의미 토큰만 참조해서, 캡션 색 대비가 부족했을 때 원시 두 개와 의미 하나만 고쳐서 끝냈어요. `--color-control-surface`는 칩·인풋 배경인데 기본은 화이트고, `.bj-card` 같은 화이트 면 컨테이너가 이 변수를 크림으로 덮어써요. CSS 변수가 상속되니까 카드 안의 칩은 자동으로 크림이 되고, 호출부는 배경을 몰라도 돼요."
- **꼬리 질문**
  1. *"다크 모드는?"* → 없다(확인). 구조상 `:root`에서 의미 토큰만 바꾸면 되는 구조라고 답하기.
  2. *"원시 토큰을 직접 쓴 곳 없나요?"* → `var(--p-*)`는 `tokens.css` 밖에서 **0건**(확인). hex는 아래 5장 참고.
- **약점/주의**: 5장의 hex 예외 목록을 알고 있을 것.

---

### Q13. 공용 컴포넌트는 어떻게 구성돼 있나요? (디자인 시스템 페이지)

- **근거 파일**: `src/shared/ui/index.ts`(+ 30여 파일), `src/shared/styles/components.css`(3,600줄+), `src/app/design-system/page.tsx`, `docs/DESIGN.md`
- **이 프로젝트에선**
  - 3층 구조(README): `tokens.css` → `components.css`의 `.bj-*` 클래스 → `shared/ui/*.tsx` 래퍼 → 화면.
  - `shared/ui/index.ts` 주석: "components.css의 .bj-* 클래스 래핑. **자체 스타일 없음**." 즉 React 컴포넌트는 className 조합기다:
    ```tsx
    // Button.tsx
    const classes = ['bj-btn', `bj-btn--${variant}`, block && 'bj-btn--block', className].filter(Boolean).join(' ')
    return <button type={type} className={classes} {...rest}>{children}</button>
    ```
  - `/design-system` 페이지는 갤러리(승인용 미리보기, 444줄).
  - **실제 사용 현황** (0장 참고): `Button`·`Chip`·`Card` 등 단순 래퍼는 화면에서 **안 쓰고 클래스를 직접** 쓴다. 쓰이는 건 로직·상태가 있는 것들(`IllustPlaceholder`의 onError 폴백, `LoginGateSheet`, `ConfirmSheet`, `Sheet`, `Stars`의 반 개 별 clip-path, `BackLink`, `Icon`).
  - 도메인 위젯: `widgets/bottom-nav/BottomNav.tsx`가 `shared/ui`의 `BottomNav/NavItem`을 조립하고 `usePathname`으로 활성 탭 판단.
- **말로 하는 답변 (정직 버전)**
  "디자인 시스템의 본체는 `components.css`의 `.bj-*` 클래스예요. Figma 컴포넌트를 클래스로 옮기고, 토큰만 참조하게 했어요. React 래퍼도 만들었는데 실제 화면에서는 버튼·칩·카드처럼 로직이 없는 건 클래스를 직접 쓰고, 이미지 폴백이나 시트처럼 상태가 있는 것만 컴포넌트를 써요. `/design-system` 페이지는 그 클래스들을 한눈에 보는 갤러리고요. 돌아보면 버튼·칩도 래퍼로 강제했어야 클래스 오타 같은 걸 타입으로 막을 수 있었다고 생각해요."
- **꼬리 질문**: *"그럼 React 컴포넌트 Button은 왜 있나요?"* → 갤러리 페이지와 일부(`HomeTopbar`, `MatchInviteView`)에서만 import. "만들었지만 화면 이식이 안 끝났다"가 사실.
- **약점/주의**: 지원서 문구 그대로 말하면 면접관이 `grep '<Button'` 한 번으로 반박 가능. 반드시 정직 버전으로.

---

### Q14. 로딩·빈 상태·에러는 어떻게 처리했나요?

- **근거 파일**: `docs/DESIGN.md`(상태와 방어), `src/views/home/ui/HomeView.tsx`, `src/views/discover/ui/DiscoverView.tsx`, `src/views/rate/ui/RateView.tsx`, `src/app/(main)/error.tsx`, `src/app/global-error.tsx`, `src/app/not-found.tsx`, `src/shared/lib/toast.ts`
- **기본 개념**
  목록 화면은 **정상 / 로딩 / 비었음 / 실패** 4가지 얼굴이 필요하다. 가장 흔한 버그는 "불러오는 중인데 '아직 없어요'가 먼저 보이는 것"이다. 초기값 `[]`를 그대로 그리면 생긴다.
- **이 프로젝트에선**
  - **로딩 ≠ 빈 상태** 패턴(HomeView): `loadedFor`에 "어떤 조건으로 불러왔는지"를 저장하고 `loadedOnce = loadedFor === feedParams`일 때만 빈 상태를 그린다.
    ```tsx
    {loadedOnce && mainFeed.length === 0 && scope === 'all' && (
      <div className="bj-card bj-text-center">
        <p className="bj-h2">아직 올라온 글이 없어요</p>
        <Link href="/posts/new" className="bj-btn bj-btn--primary">첫 글 쓰기</Link>   // 빈 상태 + CTA
      </div>
    )}
    {loading && <p className="bj-caption ...">글 불러오는 중…</p>}
    ```
  - **에러 경계**: `(main)/error.tsx`("잠시 문제가 생겼어요" + 다시 시도), `global-error.tsx`, `not-found.tsx`(404 + 홈으로).
  - **인라인 실패 + 재시도**: `DiscoverView`(`failed` → "불러오지 못했어요" + 다시 시도 버튼), `RateView`(검색 실패 문구).
  - **토스트**: 저장·전송 실패는 `toast.error()` 31곳. 입력값 유지.
  - **외부 API 실패는 그 영역만**: 알라딘 라우트는 502 JSON을 주고 화면은 그 섹션만 접는다.
  - **이미지 폴백**: `IllustPlaceholder`가 `onError`로 회색 면 대체.
- **말로 하는 답변**
  "DESIGN.md에 '모든 목록은 정상·로딩·비었음·실패 네 상태를 가진다'고 정책으로 적고, 목록 12개 중 9개가 초기값 `[]`를 그대로 그리던 걸 고쳤어요. 핵심은 로딩 분기를 빈 상태보다 먼저 판단하는 건데, 홈 피드는 '어떤 정렬로 불러왔는지'를 상태로 들고 있다가 그게 현재 조건과 같을 때만 빈 상태를 보여줘요. 에러는 Next의 `error.tsx`로 전체 경계를 잡고, 목록 실패는 인라인 재시도, 저장 실패는 토스트로 나눴어요."
- **꼬리 질문**
  1. *"스켈레톤은요?"* → **DESIGN.md는 '스켈레톤 기본'이라고 쓰여 있지만, 코드에 `skeleton`이라는 문자열이 0건이다.** 로딩은 "불러오는 중…" 텍스트(22개 뷰)이거나 빈 공간이다. "정책은 적었지만 스켈레톤 구현은 못 했다"고 인정.
  2. *"200ms 미만이면 안 띄운다는 규칙은 구현됐나요?"* → 미구현. 로딩 표시를 지연시키는 코드가 없다(확인). "정책만 있고 구현은 안 했다"로 답하기.
- **약점/주의**
  - 위 두 가지 + `tryRemote` 미사용(Q4). 문서가 코드보다 앞서 있는 항목들이다.

---

### Q15. 배포·CI·성능은 어떻게 했나요?

- **근거 파일**: `.github/workflows/ci.yml`, `src/app/layout.tsx`, `src/app/globals.css`, `docs/TROUBLESHOOTING.md`(성능·측정), `docs/LAUNCH.md`
- **이 프로젝트에선**
  - **CI**: push/PR마다 `pnpm install --frozen-lockfile → lint → typecheck → test`. 내가 직접 돌려서 18 테스트 통과, tsc 통과, lint 에러 0(경고 2: `og-card.tsx`의 `<img>`).
  - **배포**: Vercel. `vercel.json` 없음(기본 설정). 루트 레이아웃에 `<Analytics />`, `<SpeedInsights />`. `NEXT_PUBLIC_SITE_URL` 없으면 `VERCEL_PROJECT_PRODUCTION_URL`로 폴백(`site-url.ts`, LAUNCH.md).
  - **성능 기록**(TROUBLESHOOTING): 정적 이미지 164MB→4.5MB(WebP, 표시 크기 3배), Pretendard를 CSS `@import` CDN 대신 패키지 번들 dynamic-subset으로(`globals.css` 주석: "CDN link는 다른 출처라 렌더를 ~750ms 막았다"), 꾸밈 폰트 TTF→WOFF2, 첫 화면 이미지 `fetchpriority="high"`. Lighthouse 모바일 홈 65→78, LCP 9.7s→5.7s.
  - **SEO/OG**: `sitemap.ts`, `robots.ts`, 유형별 `opengraph-image.tsx`(`next/og`), `generateMetadata`.
- **말로 하는 답변**
  "Vercel에 배포하고 GitHub Actions에서 lint·typecheck·test를 돌려요. 성능은 Lighthouse 모바일로 전후 측정했는데, 가장 컸던 건 이미지였어요. 배지 원본이 1254px PNG인데 56px로 보여서 192px WebP로 줄여 164MB를 4.5MB로 만들었고, 폰트 CSS `@import`가 렌더를 750ms 막아서 패키지 번들로 바꿨어요. LCP가 9.7초에서 5.7초가 됐는데 아직 5초대라 다음은 일러스트 srcset과 클라이언트 컴포넌트 범위 축소예요."
- **꼬리 질문**: *"LCP 5.7초면 여전히 느린데?"* → 맞다. 남은 원인(212KB 일러스트, JS 번들)과 다음 단계가 문서에 적혀 있다. Q7의 "거의 전부 클라이언트"와 연결해 답하기.
- **약점/주의**: 측정이 "개선 전 1회, 후 3회 중앙값"이라 전 수치의 신뢰도가 낮다. 물으면 인정.

---

### Q16. (문서 관련) CLAUDE.md는 뭐고, AI와 어떻게 협업했나요?

- **근거 파일**: `CLAUDE.md`, `AGENTS.md`, `README.md`(AI 협업 워크플로우)
- **이 프로젝트에선**
  `CLAUDE.md`는 Claude Code가 매 세션 읽는 진입점. 내용: 문서 참조(PRD/DESIGN/ARCHITECTURE), 커밋 규칙(`feat:` prefix, 한국어 제목, lock 파일 별도 커밋), Supabase 클라이언트 구분, 상태 관리 기준, 네이밍(`*View.tsx`, `*Remote.ts`, `*Actions.ts`, 전역 `types/` 없음). `AGENTS.md`는 도구가 자동 생성한 Next.js 16 주의사항.
  커밋 50개가 전부 규칙을 따른다(`feat:/fix:/docs:/chore:` prefix 확인).
- **말로 하는 답변**
  "AI가 매번 다른 판단을 하는 게 가장 큰 비용이라서 규칙을 문서로 고정했어요. CLAUDE.md가 진입점이고 제품 사양은 PRD, 디자인 규칙은 DESIGN, 폴더 규칙은 ARCHITECTURE로 나눴어요. 예를 들어 '새 컴포넌트를 임의로 만들지 말고 제안 후 확인', '새 스토어 전에 기존 패턴부터' 같은 규칙이 있어요."
- **꼬리 질문**: *"AI가 짠 코드를 어떻게 검증했나요?"* → lint·typecheck·test CI, `rls:check`, Lighthouse 측정. 그리고 이 문서(INTERVIEW_PREP)가 그 검증의 일부라고 말해도 된다.
- **약점/주의**: "코드에 들어간 구조를 정확히 이해 못 한 부분이 있다"는 점을 면접관이 파고들 수 있다. 이 문서의 TOP 5(6장)를 완전히 소화할 것.

---

## 3. 네이밍 컨벤션 치트시트 (CLAUDE.md ↔ 실제)

| 규칙 | 실제 예 | 확인 |
|---|---|---|
| 뷰 `<PascalCase>View.tsx` | `views/social-club-detail/ui/SocialClubDetailView.tsx` | ✔ 39개 전부 |
| API 함수 `*Remote.ts` | `entities/post/api/postsRemote.ts`, `features/wishlist/api/wishlistRemote.ts` | ✔ |
| localStorage 액션 `*Actions.ts` | `entities/club/model/clubActions.ts` | △ 이름은 Actions인데 내용은 Supabase 호출 + 메모리 Set (localStorage 아님) |
| 전역 `types/` 없음 | 타입은 `model/*.ts`에 인라인 | ✔ `src/types` 없음 |
| features 폴더명 명사형 | `nickname-gate`, `follow`, `wishlist`, `quiz-test`, `post-compose` | ✔ |
| entities 서브폴더 필요한 것만 | `external-book`은 `model`만, `club`은 `api/model/ui` | ✔ |

---

## 4. 지원서 주장 검증

### ① "CLAUDE.md를 진입점으로 제품 사양·디자인 규칙·폴더 구조 문서를 역할별로 분리했다" — **맞음**
- `CLAUDE.md` 첫 섹션이 "문서 참조"로 `docs/PRD.md`, `docs/DESIGN.md`, `docs/ARCHITECTURE.md`를 가리킨다. 세 파일 모두 존재하고 내용이 역할대로 나뉘어 있다.
- 주의: `docs/TROUBLESHOOTING.md`, `docs/LAUNCH.md`는 CLAUDE.md에는 없고 README에서만 링크된다. 사소함.

### ② "FSD를 변형해 파일 간 의존성을 낮췄다" — **대체로 맞음, 근거 보강 필요**
- 맞는 부분: 6레이어, `views` 추가, 29개 page가 5줄 위임, 상위→하위 방향 위반(views→app, features→views, widgets→views) **0건**.
- 약한 부분: 의존성 규칙을 **도구로 강제하지 않는다**(ESLint 경계 규칙 없음). `shared → entities` 위반 2곳(`TopActions.tsx`, `currentUser.ts`), entities 간 교차 import 6쌍.
- 말할 때: "레이어 방향은 지켰고, 강제는 문서로만. 다음은 lint 규칙" 정도로.

### ③ "디자인 시스템을 먼저 컴포넌트로 만들고 전 화면에서 동일하게 사용했다" — **절반만 맞음 (가장 위험)**
- 맞는 부분: 토큰→클래스→래퍼 3층이 있고, `.bj-*` 클래스는 전 화면에서 동일하게 쓴다. `/design-system` 갤러리 존재. `shared/ui`에 30개 파일.
- 틀린 부분: `Button`·`Chip`·`Card` 등 React 컴포넌트는 **화면에서 0회** 사용. 화면은 CSS 클래스를 직접 쓴다. `DESIGN.md`의 "인라인 스타일로 우회하지 않는다"와 달리 `style={{` 61곳(대부분 동적 width/clipPath라 정당하지만 `HomeTopbar.tsx:37`은 정적 위치 지정).
- "먼저" 만들었는지는 git 히스토리가 정리(스쿼시)되어 **확인 못 함**. 최초 커밋에 이미 갤러리 페이지가 포함돼 있다.
- 말할 때: "컴포넌트" 대신 **"토큰과 `.bj-*` 클래스 체계"** 라고 고쳐 말하고, 래퍼는 상태 있는 것만 쓴다고 정확히.

### ④ "로딩·에러·긴 텍스트처럼 방어 코드가 빠진 부분을 찾아 정책으로 만들어 공통 적용했다" — **정책은 맞음, 적용은 부분적**
- 맞는 부분: `DESIGN.md` "상태와 방어" 섹션이 정책. 긴 텍스트는 `.bj-clamp-2/3/4` 클래스 + `word-break: keep-all`(`components.css:2162`) + 닉네임 12자 검증(`NicknameSheet.tsx:143`) + 상대 시간 규칙(`relTime.ts`, 7일 넘으면 날짜)이 문서와 일치. 빈 상태 CTA, 로딩≠빈 상태 패턴, `error.tsx`/`not-found.tsx`, 토스트 31곳.
- 틀리거나 미구현: **스켈레톤 0건**(정책은 "스켈레톤 기본"), **200ms 지연 규칙 미구현(해당 코드 없음)**, **`tryRemote` 호출 0건**(TROUBLESHOOTING은 "전부 감쌌다"고 기술).
- 말할 때: "정책을 문서화하고 빈 상태·clamp·상대시간·에러 경계는 적용, 스켈레톤은 미구현"으로.

### ⑤ "컴포넌트에서는 색상 원시값 대신 의미 토큰만 쓰도록 했다" — **대체로 맞음, 예외 5군데**
- `var(--p-*)`를 `tokens.css` 밖에서 쓴 곳: **0건**. ✔
- hex 직접 사용(`tokens.css` 제외):
  1. `src/shared/styles/components.css:1321-1336` — 유형별 일러스트 배경 `--illust-top` 16색 (일러스트 전용이라 DESIGN.md의 "리소 일러스트 예외"로 설명 가능하지만 컴포넌트 CSS 안에 있음)
  2. `src/app/og-card.tsx:10-13, 70` — OG 이미지(`next/og`)는 CSS 변수를 못 읽어 상수로 둠 (정당한 예외, 토큰 값과 동일)
  3. `src/views/result-detail/ui/ResultDetailView.tsx:130` — `html-to-image`의 `backgroundColor: '#ffffff'` (라이브러리 옵션, 정당)
  4. `src/entities/reading-type/model/readingTypes.ts` — `accent`·`habitatColors` 32개 hex. **어디서도 사용 안 함(죽은 데이터)**. 지우는 게 맞다.
  5. `src/views/test/ui/TestView.css:31`, `ResultDetailView.css:277` — hex는 아님(토큰 사용). 아래 ⑥ 참고.
- 말할 때: "원시 토큰 직접 참조는 0건. hex는 OG 이미지·캡처 옵션처럼 CSS 변수를 못 쓰는 곳과 일러스트 배경 16색뿐"이라고 정확히 숫자로.

### ⑥ "그림자는 떠 있는 요소(하단탭·FAB)에만 허용했다" — **맞음, 다만 box-shadow 자체는 2곳 더 있음**
- `--elevation-floating` 사용처: `components.css:588`(`.bj-bottomnav`), `:3170`(`.bj-fab`). 정확히 두 곳. ✔
- 그 외 `box-shadow`:
  - `src/views/test/ui/TestView.css:31` — `.bj-test-dot--current { box-shadow: 0 0 0 3px var(--color-accent-weak) }` → 그림자가 아니라 **링(outline 대용)**
  - `src/views/result-detail/ui/ResultDetailView.css:277` — `box-shadow: inset 8px 0 0 var(--color-accent-weak)` → **책등 표현(inset)**
- 면접관이 "`grep box-shadow`하면 4건인데?"라고 하면: "두 건은 elevation이 아니라 링과 inset 장식이고, 떠 있는 요소의 그림자 토큰은 하단탭·FAB 두 곳"이라고 답하기. 더 엄격히 하려면 `outline`으로 바꿀 수 있다고 덧붙이기.

---

## 5. 참고: 빠르게 꺼내 쓸 숫자

| 항목 | 값 |
|---|---|
| 뷰 파일 | 39개 (`'use client'` 38개) |
| `page.tsx` | 40개 (5줄 위임 29개, `generateMetadata` 2개, 정적 페이지 5개, 갤러리 1개) |
| zustand 스토어 | 2개 |
| localStorage 키 | `book_test_result`, `book_nickname`, `book_avatar`, `book_my_id`, `book_wishlist`, `book_wishlist_synced_at`, `book_ratings`, `book_blind_ratings`, `book_activity_log`, `bj_following_seen_{id}` |
| Supabase 브라우저 클라이언트 사용 파일 | 24개 |
| RLS 테이블(schema.sql) | 13개 + 마이그레이션 추가분 |
| 마이그레이션 | 24개 (`0002`~`0025`) |
| 테스트 | 3파일 18케이스 (채점·궁합·배지, 블라인드 가림/셔플, 상대 시간) |
| 알라딘 라우트 | 3개 + 블라인드 라우트 1개 |
| 토스트 에러 호출 | 31곳 |
| `useMounted` 사용 | 8파일 |

---

## 6. 모르면 위험한 것 TOP 5

### 1. 책 API는 알라딘이다. 카카오는 로그인에만 쓴다.
지원서·입으로 "카카오 도서 API"라고 하면 `src/app/api/aladdin/`을 본 면접관과 즉시 어긋난다. 환경변수 이름 `ALADDIN_TTB_KEY`, 라우트 3개 이름(`list/search/lookup`), 캐시 시간(목록 1시간·한 권 하루)까지 외울 것.

### 2. "컴포넌트로 만든 디자인 시스템"의 실체는 `.bj-*` CSS 클래스다.
`<Button>`은 화면에서 0회. `grep` 한 번이면 드러난다. "토큰 → 클래스 → (상태 있는 것만) React 래퍼"로 정확히 말하고, 래퍼 이식이 안 끝난 걸 개선점으로 돌릴 것.

### 3. 데이터가 어디 사는지 표(Q3)를 통째로.
좋아요=DB만 / 찜·별점=DB 원본+로컬 사본+sync / 닉네임=DB 원본+로컬 캐시 / 유형=DB에 코드만, 로컬에 전체 / 활동 점수=로컬만. 그리고 **충돌 규칙**: 별점은 최근 값, 유형은 서버 우선(공용 기기 이유).

### 4. 인증 흐름 4단계와 `getUser` vs `getSession`, 그리고 anon key가 공개여도 되는 이유(RLS).
`signInWithOAuth → /auth/callback에서 exchangeCodeForSession → 쿠키 → proxy.ts가 매 요청 getUser로 갱신`. RLS 정책 패턴 한 줄(`auth.uid() = author_id`)과 집계 컬럼 트리거(`pg_trigger_depth`)까지 말할 수 있으면 강하다.

### 5. 화면이 거의 전부 클라이언트 컴포넌트라는 사실과 그 비용.
page.tsx만 서버, views 38/39가 `'use client'`, 데이터는 전부 `useEffect`. 장점(상호작용·localStorage 자유)과 비용(LCP 5초대, 서버 페칭 미활용)을 둘 다 말하고, 다음 단계(첫 페이지 서버 페칭, `useMounted`로 하이드레이션 관리)를 붙일 것.

**덤 — 면접관이 링크를 누르면 터지는 것**: `docs/TROUBLESHOOTING.md`의 커밋 링크 17개 중 8개가 404(히스토리 정리로 해시가 바뀜). 그리고 `tryRemote`는 정의만 있고 호출이 없다. 둘 다 "알고 있고, 문서를 코드에 맞춰 고칠 것"이라고 먼저 말하면 오히려 신뢰를 얻는다.
