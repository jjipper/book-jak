@AGENTS.md
@docs/design/DESIGN_PRINCIPLES.md

## 커밋 규칙

- 커밋 전 `git config user.name` / `user.email` 확인 — `jjipper` 계정인지 반드시 체크
- `Co-Authored-By: Claude ...` 줄 절대 넣지 말 것
- 커밋 메시지 앞에 타입 prefix 필수: `feat:` / `fix:` / `refactor:` / `chore:` / `docs:`
- 기능 단위로 파일을 나눠 커밋 (한 커밋에 연관 없는 변경 섞지 않기)
- 제목은 한국어, 명사형 또는 동사 원형으로 간결하게
- `package-lock.json` / `pnpm-lock.yaml` 등 lock 파일은 별도 `chore:` 커밋으로 처리
