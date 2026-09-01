# 북작 (BOOKJAK) — 디자인 원칙

> 토큰 정본: `src/shared/styles/tokens.css`

## 컨셉

**취향으로 북적이는 독서 취향 소셜.**
비주얼은 "리소 힙-키치" — 차분한 크림 베이스 위에, 쨍한 포인트와 형광 리소 일러스트로 개성을 얹는다.

---

## 필수 규칙

1. **UI 강조는 주황(`--color-accent`) 하나로 통일.**
   버튼·활성 상태·스탯 채움·뱃지 강조 등 모든 UI 강조는 주황만. 파랑·노랑 등 다른 색을 버튼/텍스트/보더에 쓰지 않는다.
   *(리소 일러스트 자체의 형광색은 예외 — UI 요소가 아니라 그림이므로.)*

2. **컴포넌트는 의미 토큰만 참조.**
   `--color-*` · `--font-*` · `--radius-*` · `--space-*` 만 사용. `#hex` 원시값이나 `--p-*` 원시 토큰을 컴포넌트·화면에 직접 쓰지 않는다.

3. **폰트 역할 분리.**
   - `와일드각`(`--font-display`) → 별명·로고·희소도 뱃지 등 "확 튀는 자리"만.
   - `Pretendard`(`--font-body`) → 그 외 모든 텍스트.
   - 본문·설명·버튼 라벨에 와일드각을 쓰면 가독성이 무너진다.

4. **모든 화면은 반응형.**

---

## 컬러 역할

| 역할 | 토큰 | 용도 |
|---|---|---|
| 페이지 배경 | `--color-bg` (크림) | 앱 전체 바탕 |
| 카드 표면 | `--color-surface` (화이트) | 카드·모달 |
| 컨트롤 면 | `--color-control-surface` | 칩·선택지·인풋·태그. 아래 "면 위계" 참고 |
| 텍스트 | `--color-text` (잉크) | 본문. 순수 검정 대신 따뜻한 잉크 |
| 액션 | `--color-accent` (주황) | 버튼·강조·활성. UI 유일 포인트 |
| 액션 틴트 | `--color-accent-weak` | 선택지 활성 배경 등 연한 강조 |
| 트랙 | `--color-track` | 진행바·비활성 채움·disabled 버튼 |

---

## 타이포 스케일

| 클래스 | 폰트 | 용도 |
|---|---|---|
| `.bj-display--xl` | 와일드각 | 로고, 결과 카드 별명 |
| `.bj-display--lg` | 와일드각 | 유형 별명(리스트) |
| `.bj-h1` | Pretendard | 섹션 제목 |
| `.bj-h2` | Pretendard | 소제목 |
| `.bj-body` | Pretendard | 본문 |
| `.bj-caption` | Pretendard | 부가 정보·희소도 % |

---

## 형태

- **라운드** — 컨트롤(버튼/인풋) `--radius-md`, 카드 `--radius-lg`, 뱃지 `--radius-pill`.
- **테두리·그림자 사용 안 함.** 위계는 색(크림/화이트/잉크)으로만 만든다.

### 면(surface) 위계

**컨트롤은 담긴 면과 항상 한 단 달라야 한다.** 이걸 호출부가 신경 쓰지 않도록 `--color-control-surface` 토큰이 상속으로 처리한다.

- 기본값은 화이트 → 크림 페이지 위 컨트롤은 화이트.
- 화이트 면 컨테이너(`.bj-card`, `.bj-question`, `.bj-row`, `.bj-sheet`, `*-card` 계열)가 이 토큰을 크림으로 덮어쓴다 → 카드 안 컨트롤은 크림.
- 컨트롤(칩·선택지·인풋·텍스트에어리어·태그)의 배경은 `--color-bg`/`--color-surface`를 직접 쓰지 말고 **항상 `--color-control-surface`**. 직접 쓰면 크림 위 크림으로 사라진다.

### 테두리를 남기는 예외

면만으로 구분이 불가능한 곳에만 쓴다. 현재 3곳뿐:

- `.bj-topbar__divider` — 세로 구분선
- `.bj-discover-card__reviews` — 카드 내부 가로 구분선
- `.bj-frame` (≥900px) — 데스크톱 "종이 한 장" 바깥 테두리

포커스·선택 표시는 border가 아니라 **`outline`**(레이아웃 밀림 없음): 인풋 포커스 `outline: 2px solid var(--color-focus-ring)`, 이미지 타일 선택 `outline: 2px solid var(--color-accent)`.

### 컨트롤 규칙

- **버튼** — `min-height: 48px`, `--radius-md`, 무테. primary=주황 채움 / secondary=주황100 채움·주황600 텍스트 / text=`--color-control-surface` 면.
- **disabled** — `opacity` 쓰지 말고 `--color-track` 채움 + `--color-text-caption` 텍스트.
- **섹션 라벨** — 대문자·자간·구분선 폐기. 라벨 텍스트만으로 구획한다.
- **바텀시트** — 그래버 48×4를 `::before`로 자동 생성. 마크업에 넣지 않는다.

---

## 카피 톤 (UI 문구)

- 유쾌하고 담백하게.
- 버튼은 동사로 시작, 문장부호 없이. (예: "테스트 시작", "결과 공유")

---

## 컴포넌트 · 스타일 규칙

새 UI를 만들기 전, 아래 순서로 판단한다.

1. **기존 컴포넌트로 되는가?** 아래 목록에 있으면 그대로 쓴다.
2. **없으면 만들지 말고 제안 후 확인받는다.** 화면에 인라인 스타일로 우회하지 않는다.

**`src/shared/ui/`** — 공용 UI
`StarRating` · `Stars` · `Button` · `IconButton` · `Chip` · `Sheet` · `Toast` · `Card` · `Row` · `Progress` · `IllustPlaceholder` · `RarityBadge` · `RarityTag` · `SectionLabel` · `Segmented` · `Toggle` · `Input` · `Textarea` · `Callout` · `Check` · `Option`

**`src/widgets/`** — 도메인 위젯
`BookRow` · `ExternalBookRow` · `BlindBookCard` · `BottomNav` · `AuthProvider`

### CSS 배치 규칙

- **컴포넌트 파일 안에서 스타일링하지 않는다.** 스타일은 항상 `.css` 파일로 분리한다.
- **여러 화면이 공유하는 범용 클래스**(버튼·카드·시트 등 atoms)만 `src/shared/styles/components.css`에 둔다. 추가 전, 기존 `.bj-*`로 표현되는지 먼저 확인.
- **특정 화면·기능 전용 CSS**는 `components.css`에 얹지 않는다. 해당 뷰/위젯 폴더에 전용 `.css`를 두고 그 컴포넌트에서 직접 import 한다.
  예: `views/social-hub/ui/SocialHubView.css` → `SocialHubView.tsx`에서 import.
- 클래스 네이밍은 항상 `.bj-*` 접두사 유지.****