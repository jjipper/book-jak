# 북작 (BOOKJAK)

> 취향으로 북적이는 독서 취향 소셜 서비스

책을 "얼마나 많이 읽었는가"가 아니라 "어떤 취향으로 읽는가"를 중심에 둔 독서 소셜 플랫폼입니다.
16가지 독서 유형 테스트로 자신의 독서 취향을 진단하고, 취향이 맞는 사람과 책 모임을 통해 연결됩니다.

## 주요 기능

### 독서 취향 테스트
- 12개 문항으로 4개 축(감정형/사유형, 즉흥형/계획형 등)을 조합한 16가지 독서 유형 산출 (MBTI 스타일)
- 유형별 희귀도(%), 능력치, 궁합 유형, 경고·운세 문구 등 상세 결과 제공
- 결과 카드를 이미지로 캡처해 SNS에 공유 가능 (`html-to-image`)
- 두 사람의 유형 코드로 궁합 점수를 계산하는 결과 비교 기능

### 블라인드 북 평가 & 취향 기반 추천
- 표지·제목을 가린 "블라인드 카드"로 선입견 없이 책을 평가하는 발견(Discover) 탭
- 날짜 시드 기반 결정적 셔플로 매일 같은 "오늘의 발견" 5권 제공
- 내 평가 이력(태그별 평균 별점)을 바탕으로 특정 책의 예상 점수·매칭도를 계산하는 개인화 로직

### 소셜
- 팔로우 / 좋아요 / 책 모임(클럽) 생성·가입
- 취향 유형 궁합과 겹치는 태그·책을 기준으로 나와 잘 맞는 사람 매칭
- 소셜 랭킹, 토론(디스커션) 게시판

### 그 외
- 카카오 도서 검색 API 연동 (제목·저자 통합 검색, ISBN 단건 조회)
- 카카오 OAuth 소셜 로그인
- 위시리스트, 별점 평가, 닉네임 게이트(최초 방문 시 닉네임 설정)

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 상태관리 | Zustand (전역 상태 필요 시) + localStorage 기반 순수 함수 패턴 (단순 저장/조회) |
| 백엔드 / 인증 | Supabase (Auth, DB) — 카카오 OAuth 연동 |
| 외부 API | 카카오 도서 검색 API (서버 라우트에서 프록시, REST 키 서버측 은닉) |
| 이미지 생성 | html-to-image (결과 카드 캡처·공유) |
| 배포 | Vercel |
| 아키텍처 | FSD(Feature-Sliced Design) 변형 — `app / views / widgets / features / entities / shared` |

### 아키텍처 특징
- `app`은 라우팅 껍데기만 담당, 실제 화면 로직은 `views/*/ui/*View.tsx`에 위임해 라우트와 화면 로직을 분리
- `views` 폴더명은 라우트 경로를 kebab-case로 평탄화 (`/social/clubs/[id]` → `views/social-club-detail`)
- `entities`는 필요한 서브폴더(`ui`/`model`/`api`)만 선택적으로 구성해 불필요한 보일러플레이트 최소화
- Supabase 클라이언트를 용도별(브라우저/서버/레거시)로 분리해 클라이언트-서버 경계를 명확히 관리

## 실행 방법

### 요구사항
- Node.js 20 이상
- Supabase 프로젝트 (Auth + DB)
- 카카오 개발자 REST API 키 (도서 검색용)

### 설치

```bash
git clone <repository-url>
cd book-jak
npm install
```

### 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 값을 채워 넣습니다.

```bash
NEXT_PUBLIC_SUPABASE_URL=       # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Supabase anon key
KAKAO_REST_KEY=                 # 카카오 개발자센터 REST API 키 (도서 검색 · 로그인)
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 기타 명령어

```bash
npm run build   # 프로덕션 빌드
npm run start   # 프로덕션 서버 실행
npm run lint    # ESLint 검사
```

## 디자인 시스템

`/design-system` 라우트에서 컴포넌트·토큰을 확인할 수 있습니다. 디자인 원칙은 [`docs/design/DESIGN_PRINCIPLES.md`](./docs/design/DESIGN_PRINCIPLES.md)에 정리되어 있습니다.
