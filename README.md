# 북작 (BOOKJAK)

> 취향으로 북적이는 독서 취향 소셜 서비스

책을 "얼마나 많이 읽었는가"가 아니라 "어떤 취향으로 읽는가"를 중심에 둔 독서 소셜 플랫폼입니다.
16가지 독서 유형 테스트로 자신의 독서 취향을 진단하고, 취향이 맞는 사람과 책 모임을 통해 연결됩니다.

**라이브** · https://book-jak.vercel.app　|　**디자인 시스템** · https://book-jak.vercel.app/design-system

<!-- 스크린샷: docs/images/ 에 파일을 넣으면 표시됩니다 -->
| 독서 유형 결과 | 블라인드 북 | 책 평가 |
|---|---|---|
| ![독서 유형 결과](docs/images/result.png) | ![블라인드 북](docs/images/discover.gif) | ![책 평가](docs/images/rate.png) |

## 주요 기능

### 독서 취향 테스트
- 12개 문항으로 4개 축(감정형/사유형, 즉흥형/계획형 등)을 조합한 16가지 독서 유형 산출 (MBTI 스타일)
- 유형별 희귀도(%), 능력치, 궁합 유형, 경고·운세 문구 등 상세 결과 제공
- 결과 카드를 이미지로 캡처해 SNS에 공유 가능 (`html-to-image`)
- 두 사람의 유형 코드로 궁합 점수를 계산하는 결과 비교 기능

### 블라인드 북 평가 & 취향 기반 추천
- 표지·제목을 가린 "블라인드 카드"로 선입견 없이 책을 평가하는 발견(Discover) 탭
- 알라딘 베스트셀러·신간에서 날짜별로 모든 사용자에게 같은 "오늘의 발견" 5권 제공
- 내 평가 이력(태그별 평균 별점)을 바탕으로 특정 책의 예상 점수·매칭도를 계산하는 개인화 로직

### 소셜
- 팔로우 / 좋아요 / 책 모임(클럽) 생성·가입
- 취향 유형 궁합과 겹치는 태그·책을 기준으로 나와 잘 맞는 사람 매칭
- 소셜 랭킹, 토론(디스커션) 게시판

### 그 외
- 알라딘 도서 API 연동 (카테고리 목록·검색·ISBN 단건 조회)
- 카카오 OAuth 소셜 로그인
- 위시리스트, 별점 평가, 닉네임 게이트(최초 방문 시 닉네임 설정)

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 상태관리 | Zustand (전역 상태 필요 시) + localStorage 기반 순수 함수 패턴 (단순 저장/조회) |
| 백엔드 / 인증 | Supabase (Auth, DB) — 카카오 OAuth 연동 |
| 외부 API | 알라딘 도서 API (서버 라우트에서 프록시, TTBKey 서버측 은닉) |
| 이미지 생성 | html-to-image (결과 카드 캡처·공유) |
| 배포 | Vercel |
| 아키텍처 | FSD(Feature-Sliced Design) 변형 — `app / views / widgets / features / entities / shared` |

### 아키텍처 특징

FSD를 기준으로 하되 Next.js App Router에 맞게 바꿨습니다. 규칙 전문은 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)에 있습니다.

- **`views` 레이어 추가** — App Router는 `app/` 아래 파일 위치가 곧 URL이라, 화면 코드를 거기 두면 라우트를 옮길 때 화면 코드도 같이 흔들립니다. 그래서 `app/*/page.tsx`는 `views/*/ui/*View.tsx`를 렌더링만 하고(약관 등 정적 페이지 제외), 화면 로직은 `views`에 둡니다. 폴더명은 라우트 경로를 kebab-case로 평탄화합니다 (`/social/clubs/[id]` → `views/social-club-detail`).
- **`entities` 서브폴더는 필요한 것만** — `ui`/`model`/`api` 3종을 기계적으로 만들지 않습니다 (예: `external-book`은 `model`만, `club`은 `api`·`model`·`ui`). 빈 폴더는 구조를 설명하지 않고 노이즈만 됩니다.
- **`shared` 승격은 두 번째 사용처가 생길 때** — "지금 두 곳 이상에서 쓰이는가"가 기준입니다. 미리 공통화하면 한 곳만 바뀌어야 할 때 다른 곳까지 깨지기 때문입니다.
- Supabase 클라이언트를 용도별(브라우저: 클라이언트 컴포넌트 / 서버: 서버 컴포넌트·라우트 핸들러)로 분리해 클라이언트-서버 경계를 명확히 관리

## 실행 방법

### 요구사항
- Node.js 20 이상
- pnpm
- Supabase 프로젝트 (Auth + DB)
- 알라딘 TTBKey (도서 데이터용)

### 설치

```bash
git clone https://github.com/jjipper/book-jak.git
cd book-jak
pnpm install
```

### 환경변수 설정

```bash
cp .env.example .env.local
```

| 키 | 필수 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | O | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | O | Supabase anon key |
| `ALADDIN_TTB_KEY` | O | [알라딘 TTBKey](https://www.aladin.co.kr/ttb/wapui/wapi_guide.aspx) — 책 목록·검색·상세 (서버 전용) |
| `SUPABASE_DB_URL` | | DB 접속 URI — 마이그레이션 실행 시 |
| `NEXT_PUBLIC_SITE_URL` | | 배포 도메인 — OG·sitemap 절대 URL 기준 |

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 기타 명령어

```bash
pnpm build                  # 프로덕션 빌드
pnpm start                  # 프로덕션 서버 실행
pnpm lint                   # ESLint 검사
pnpm typecheck              # 타입 검사 (tsc --noEmit)
node scripts/migrate.mjs    # supabase/migrations 중 미적용분 실행
```

## 디자인 시스템

[`/design-system`](https://book-jak.vercel.app/design-system)에서 공용 컴포넌트 갤러리를 볼 수 있습니다. 전체 규칙은 [`docs/DESIGN.md`](./docs/DESIGN.md)에 있습니다.

### 핵심 규칙
- **UI 강조는 주황 하나.** 버튼·활성·뱃지 모두 `--color-accent`만 씁니다. 형광색은 일러스트에만 씁니다.
- **테두리 없이 면 색으로 위계.** 크림(페이지) / 화이트(카드) / 잉크(텍스트)로 구분합니다. 그림자는 스크롤 콘텐츠 위에 뜨는 하단탭·FAB에만 예외로 씁니다.
- **컨트롤 면은 상속으로 자동 대비.** 칩·인풋은 `--color-control-surface`를 쓰고, 화이트 카드 안에서는 이 토큰이 크림으로 바뀝니다. 호출부가 배경을 신경 쓰지 않아도 됩니다.
- **컴포넌트는 의미 토큰만 참조.** `#hex`나 원시 토큰(`--p-*`)을 직접 쓰지 않습니다.

### 참조 구조

```
src/shared/styles/tokens.css       primitive  --p-orange-500 …
                                       ↓
                                   semantic   --color-accent, --color-control-surface …
src/shared/styles/components.css   .bj-btn, .bj-card, .bj-chip …   (semantic 토큰만 사용)
                                       ↓
src/shared/ui/*.tsx                Button → .bj-btn--primary …
                                       ↓
src/views/*/ui/*View.tsx           화면 (화면 전용 CSS는 같은 폴더의 *.css)
```

## AI 협업 워크플로우

Claude Code로 개발하면서, AI가 매번 같은 판단을 하도록 규칙을 문서로 고정했습니다. [`CLAUDE.md`](./CLAUDE.md)를 진입점으로 두고, 상세 규칙은 역할별 문서로 나눴습니다.

| 문서 | 역할 |
|---|---|
| [`CLAUDE.md`](./CLAUDE.md) | 진입점 — 문서 안내, 커밋 규칙, Supabase 클라이언트 구분, 상태 관리 기준, 네이밍 |
| [`docs/PRD.md`](./docs/PRD.md) | 제품 사양 |
| [`docs/DESIGN.md`](./docs/DESIGN.md) | 디자인 규칙 — 토큰, 면 위계, 로딩·에러·긴 텍스트 처리 |
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | 폴더 구조와 배치 기준 |
| [`AGENTS.md`](./AGENTS.md) | Next.js 16 버전별 주의사항 (도구 자동 생성) |

대표 규칙:
- **컴포넌트를 임의로 만들지 않는다** — 기존 컴포넌트로 안 되면 만들지 말고 제안 후 확인받는다 (`DESIGN.md`).
- **새 전역 스토어 전에 기존 패턴부터** — zustand는 여러 컴포넌트가 함께 리렌더링돼야 할 때만, 단순 저장/조회는 `entities/*/model`의 순수 함수 + localStorage (`CLAUDE.md`).
- **Supabase 클라이언트를 용도별로 구분** — 클라이언트 컴포넌트는 browser, 서버 컴포넌트·라우트 핸들러는 server (`CLAUDE.md`).
- **지울 때는 흔적까지** — 기능 삭제 시 model·api·타입·라우트까지 함께 지운다 (`ARCHITECTURE.md`).
