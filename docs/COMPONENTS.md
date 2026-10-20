# 컴포넌트 스펙 — Figma `🧩 02 Components` 측정값

Figma 페이지 02의 컴포넌트를 그대로 옮긴 수치표. 코드(`src/shared/styles/components.css`, `src/shared/ui/*`)는
이 표를 기준으로 맞춘다. 색은 전부 `tokens.css`의 토큰으로 쓴다 (hex는 대조용).

폭은 참고값이다 — 시안 프레임 375 · 좌우 패딩 16 → 본문 343, 카드 패딩 16 → 카드 안 311.
코드는 고정폭 없이 `width: 100%`, 앱 전체는 `--app-width: 420px`에서 멈춘다.

공통: 무테(테두리 없음). 라운드 — 컨트롤 12 / 카드 16 / 시트·모달 20 / 칩·배지·탭 pill.
컨트롤(칩·선택지·인풋·텍스트에어리어·태그·텍스트 버튼)은 **담긴 면과 한 단 다르게**:
크림 페이지 위 = 화이트, 화이트 카드 안 = 크림 `#F7EFE6` (`--color-control-surface` 상속).

| 토큰 | hex | 쓰임 |
|---|---|---|
| 주황500 `--color-accent` | #F0562E | 채움·아이콘·활성 |
| 주황600 `--color-accent-hover` | #D8451F | 눌림 면 · 작은 주황 글자(값·라벨) |
| 주황100 `--color-accent-weak` | #FBE5CF | 세컨더리 버튼 · 유형 배지 · 토큰 배지 · 스포트라이트 테두리 |
| 잉크900 `--color-text` | #1A1A2E | 본문·아이콘 |
| 잉크600 `--color-text-muted` | #5A5A68 | 보조 텍스트·차트 라벨 |
| 잉크400 `--color-text-caption` | #90909E / #9A9AA4 | 캡션·플레이스홀더·비활성 라벨 |
| 눌림 `--color-track` | #E7E3D9 | 비활성 채움·토글 off·아바타 기본·크림 위 트랙 |
| 차트 트랙 | #F2EEE4 | 흰 카드 안 트랙 (StatBar·Progress·Gauge·BarChart·미획득 메달) |
| 크림 컨트롤 | #F7EFE6 | 흰 카드 안 컨트롤 면 · SegTab 바탕 |
| 소프트 아이콘 | #C2C2CC | 하트·댓글 아이콘 (숫자 #9A9AA4) |

---

## 기본 컨트롤

### 버튼 Button
- 높이 48 · 라운드 12 · 라벨 14 · 블록(폭 100%).
- 프라이머리 주황500 / 화이트 Bold · 눌림 주황600 / 화이트 Bold
- 세컨더리 주황100 / 주황600 Medium · 텍스트 화이트(컨트롤 면) / 주황500 Medium
- 비활성 눌림 #E7E3D9 / 잉크400 Bold (opacity 금지)

### 작은 버튼 ButtonSmall
- 높이 32 · 라운드 12 · 좌우 패딩 14 · 라벨 13 Medium 주황500 · 화이트 면 · 폭 hug.
- 헤더·카드 안 보조 액션(다시하기·수정).

### 아이콘 버튼 IconButton
- 히트영역 36×36 pill · 아이콘 22 면.
- 기본 배경 없음 / 아이콘 잉크900 · 활성 아이콘 주황500 · 눌림 눌림 #E7E3D9 원.

### 플로팅 버튼 FAB
- 56 원 · 주황500 · 아이콘 edit 22 화이트 · `--elevation-floating`.

### 선택지 Option
- 높이 48 · 라운드 12 · 좌우 패딩 16. key(Wildgak 14) + 본문(Pretendard 14).
- 기본 화이트 / key 잉크600 / 본문 Regular
- 기본 카드안 화이트 + 크림 #F7EFE6 1px (흰 카드 안일 때만)
- 선택됨 화이트 + 주황500 1.5px 테두리 / key·본문 주황 Bold — 선택 표시는 `outline`, border 아님.

### 칩 Chip
- 높이 32 · pill · 라벨 14 Medium · 좌우 패딩 12 · 아이콘 14 면(아이콘 변형).
- 크림 위: 기본 화이트/잉크900. 흰 카드 안: 기본 크림 #F7EFE6/잉크900.
- 활성 주황500/화이트 · 잉크 잉크900/화이트 — 바탕과 무관.
- **작은 칩(카드 종류 라벨)**: 높이 26 · 라벨 12 Medium · 패딩 12/6 — RecCard·ClubCard·BlindCard 상단.

### 필터 셀렉트 FilterSelect
- 화이트 면 · 라운드 8 · 높이 28 · 좌우 패딩 14 · 라벨 14 Regular 잉크900 + caret-down 12 면 · 폭 hug.

### 인풋 Input · 텍스트에어리어 Textarea
- 라운드 12 · 패딩 12 · 본문 14 Regular · 플레이스홀더 잉크400 · 입력값 잉크900.
- 인풋 44 / 텍스트에어리어 96.
- 크림 위 화이트 / 흰 카드 안 크림 #F7EFE6 (`--color-control-surface`).
- 포커스 `outline: 2px solid 주황500`.

### 별점 StarRating · 별 Star
- 일러스트 별 24 · 간격 6 · 채움 주황500 / 빈칸 눌림 #E7E3D9.
- 행 안(RateRow) 축소 시 16.

### 토글 Toggle · 체크 Check
- 토글 40×22 pill · off 눌림 / on 주황500 · 노브 화이트 18.
- 체크 20×20 라운드 8 · 미체크 눌림 / 체크됨 주황500 + 화이트 체크.

---

## 내비게이션

### 하단탭 BottomNav
- 화이트 pill · 높이 64 · 좌우 8 인셋(359 폭) · `--elevation-floating`.
- 5탭 · TabIcon 24 면 + 라벨 11 (활성 Bold 주황500 / 기본 Medium 잉크400) · 자간 0 · 행간 140%.

### 상단바 Topbar
- 높이 40 · 좌 로고 이미지(68×30) · 우 search-solid 24 + bell-fill 24 (간격 12).

### 진행률 헤더 ProgressHeader
- 높이 42 · 상단 "1 / 12" 12 Regular 잉크400 좌 · "8%" 12 Bold 주황500 우 · 트랙 6 pill 눌림 #E7E3D9 / 채움 주황500.

### 서브페이지 헤더 SubpageHead
- 높이 32 · chevron-left 24 면 + 간격 6 + 제목 18 ExtraBold 잉크900.

### 페이지 헤드 PageHead
- 제목행 32 (제목 Wildgak 24 잉크900 + 우측 아이콘 24, 마이=settings) · 간격 6 · 캡션 18 (12 Regular 잉크400, 없으면 숨김).

### 세그 탭 SegTab
- 높이 40 · 크림 #F7EFE6 pill · 내부 패딩 4 · 세그 32 pill 1:1.
- 활성 화이트 / 14 Bold 잉크900 · 기본 투명 / 14 Medium 잉크400.

---

## 컨테이너

### 카드 Card
- 라운드 16 · 패딩 16 · 화이트 · 무테.
- 스포트라이트 화이트 + 주황100 #FBE5CF 1px (화면당 1개).

### 섹션 라벨 SectionLabel · CardSectionLabel
- 11 Medium 잉크400 · 라인 없음.

### 섹션 헤드 SectionHead
- 높이 22 · 제목 18 Bold 잉크900 좌 · 액션 12 Bold 주황500 우.

### 리스트 행 Row
- 화이트 · 라운드 12 · 높이 46 · 패딩 16/14 · 아이콘 18 + 간격 12 + 라벨 14 Bold · 우측 캡션 12 잉크400.

### 콜아웃 Callout
- 높이 48 · 라운드 12 · 패딩 14/16 · 본문 14 Regular.
- 기본 화이트 / 잉크900 · muted 눌림 #E7E3D9 / 잉크400.

### 토스트 Toast
- 주황500 10% 면 / 13 Medium 주황500 · 라운드 12 · 높이 46 · 좌우 패딩 46 · 폭 hug · 화면 하단 중앙.

### 스켈레톤 카드 SkeletonCard
- 화이트 라운드 16 · 패딩 16 · 블록 #ECE9E2 라운드 6 (아바타 20 원 · 이름 96×12 · 줄 2개 12 · 푸터 72×12).

### 빈 상태 EmptyState
- 화이트 라운드 16 · 패딩 20 · 아이콘 원 + 제목·설명 중앙 · CTA 프라이머리 버튼 48.

### 확인 모달 Modal
- 화이트 · 라운드 20 · 폭 295 · 패딩 20 · 제목 18 ExtraBold 중앙 + 설명 14 잉크600 · 버튼 2단(프라이머리/텍스트) 세로.
- 딤 잉크900 45%.

### 바텀시트 Sheet
- 화이트 · 상단 라운드 20 · 그래버 48×4 pill 눌림 (상단 12) · 제목 16 Bold · 좌우 패딩 20 · 딤 45%.

### 액션 시트 ActionSheet
- Sheet 규격 + 항목 리스트 (수정 · 삭제 · 신고) 행 48 · 14 Medium · 파괴 액션은 에러색.

---

## 배지·태그

### 희소도 태그 RarityTag
- pill 28 · 좌우 12 · Wildgak 12. 흔함 눌림/잉크600 · 희귀 주황500/화이트 · 최희귀 잉크900/화이트.

### 희소도 뱃지 RarityBadge
- md 84 / sm 56 / xs 라벨만. 흔함 원 크림 · 희귀 16꼭지 별 주황 틴트 · 최희귀 16꼭지 별 주황500/화이트.
- 라벨 Wildgak 16 · 보조 Pretendard 12.

### 유형 배지 TypeBadge
- pill 20 · 주황100 #FBE5CF · 좌우 8 · 코드 Wildgak 10 Bold 주황600.

### 토큰 배지 TokenBadge
- pill 30 · 주황100 #FBE5CF · 좌 6 우 12 · 코인 아이콘 20 (책 든 동전) + 간격 6 + 개수 14 Bold 주황500.

### 아이콘 Icon
- 24×24 · 전부 면(채움) · 기본 잉크900. heart-fill·star-fill만 주황500. 소프트(하트·댓글 카운트) #C2C2CC.
- 34종: home, compass, star, people, user, search, bell, settings, chevron-left/right, x, plus, edit, heart, comment, share, book, bookmark, lock, check, caret-down, eye, moon, flag, trash, link, clock, image, filter, sort, info, warning, logout, coin.

---

## 데이터 시각화 (2D 플랫 · 주황 1색 농도 + 트랙 #F2EEE4 · 그리드 없음)

### 스탯바 StatBar
- 행 20 · 이름 13 Medium 잉크900 (폭 76) · 트랙 10 pill #F2EEE4 / 채움 주황500 · 값 13 Bold 주황600 우.

### 프로그레스 Progress
- 트랙 10 pill #F2EEE4 / 채움 주황500 · 라벨 12 Regular 잉크600 우 ("6/12").

### 도넛 차트 DonutChart
- 160 · 링 두께 22 · 12시 시작 · 조각 사이 2° 간격 · 5조각 주황 #F0562E → #F58B6B → #F9B9A4 → #FBDFD5 + 기타 #F2EEE4.
- 중앙 라벨 14 잉크600 / 값 24 Bold 잉크900.

### 축 스펙트럼 AxisBar
- 높이 39 · 상단 좌/우 라벨 12 · 바 10 pill 트랙 + 주황 채움 + 노브 16 화이트 원(주황 2px).

### 막대 차트 BarChart
- 311×132 · 7일 세로 pill 막대 24 폭 · 트랙 #F2EEE4 위 주황 채움 · 최대값 막대만 진하게 + 상단 "7권" 12 Bold.
- 요일 11 Medium 잉크400 (최대값 요일 Bold 주황500).

### 세그먼티드 Segmented
- 라벨 12 잉크600 · 구간 바 16 pill · 주황 농도 단계.

### 게이지 Gauge
- 220×70 · 라벨 14 + 우측 "상위 7%" 칩(주황100 · 12 Bold 주황600 · 폭 66) · 바 10 pill 트랙/주황 · 값 20 Bold.

### 배지 메달 BadgeMedal
- 88 원 + 간격 6 + 이름 14 (총 111).
- 획득 일러스트 원 / 이름 Bold 잉크900 · 미획득 #F2EEE4 원 + lock 아이콘 / 이름 Medium 잉크400.

---

## 도메인 카드·행

### 포스트 카드 PostCard
- 화이트 라운드 16 · 패딩 16 · 헤더(닉네임 12 Bold · 시간 12 잉크400) · 본문 14 (행간 21) · 간격 8.
- 푸터 16: heart-soft 16 #C2C2CC + 숫자 12 #9A9AA4 · comment-soft 동일 · 간격 4/12.

### 블라인드 카드 BlindCard
- #2A2A3E 라운드 16 · 패딩 16 · 작은 칩(크림) + 핵심 문장 2줄 화이트 16 Bold + 푸터.

### 추천 카드 RecCard · 모임 카드 ClubCard (같은 골격)
- 화이트 라운드 16 · 패딩 16 · 작은 칩(종류) · 간격 18 · 제목 18 Bold · 메타 12 잉크400 (작성자 · 담긴 책 수 / 인원 · 일정).

### 사람 카드 PersonCard
- 96×109 · 아바타 60 원 눌림 + user-fill 아이콘 · 이름 14 Bold · 점수 12 주황600 · 가로 레일.

### 알림 행 NotificationRow
- 화이트 라운드 12 · 높이 58 · 패딩 16/8 · 아바타 32 + 간격 12 + 본문(14 · 시각 12) · 우측 안읽음 점 8 주황500.

### 평가 행 RateRow · 책 행 BookRow
- 화이트 라운드 12 · 높이 100 · 패딩 16/12 · 표지 60×76 라운드 8 눌림 + 간격 12 · 제목 14 Bold · 작가 12 잉크400 · 별점 16 + 점수 12.
- 책 행은 별점 슬롯만 숨김.

### 참여자 행 MemberRow
- 화이트 라운드 12 · 높이 48 · 패딩 16/8 · 아바타 32 + 닉네임 14 + TypeBadge · 우측 역할 12 잉크400.

### 댓글 행 CommentRow (질문·답글도 재사용)
- 화이트 라운드 12 · 패딩 16 · 아바타 32 + 간격 10 · 닉네임 14 잉크600 · 시각 12 · 본문 14 (행간 21).
- 답글은 좌측 들여쓰기(아바타 폭 + 간격).

### 활동 행 ActivityRow
- 화이트 라운드 12 · 높이 38 · 패딩 14/10 · 라벨 14 Regular · 우측 카운트 14 Bold 주황600 + chevron.

### 리포트 스탯 ReportStat
- 화이트 라운드 12 · 80×65 · 숫자 20 Bold 중앙 · 라벨 11 잉크400.
