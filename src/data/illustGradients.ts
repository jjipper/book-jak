import type { TypeCode } from './readingTypes'

/* 결과 카드 일러스트 뒤 배경 그라데이션(위→아래) — 상단 색 정의.
   그림 영역 전용 색이라 의미 토큰 대신 일러스트별 원시값을 여기(데이터)에 둔다.
   UI 컨트롤에는 절대 쓰지 말 것.
   ⚠️ 아래 값은 일러스트 분위기에 맞춘 1차 제안 — 확정 색은 추후 지정 예정 */
const ILLUST_GRADIENT_TOP: Record<TypeCode, string> = {
  FCER: '#FFF0C9', // 티타임 — 따뜻한 옐로
  FCEW: '#DCEDFB', // 구름 위 — 맑은 하늘색
  FCGR: '#DCE4F6', // 달밤 — 은은한 밤하늘 블루
  FCGW: '#FFE3CD', // 여우 — 부드러운 주황
  FIER: '#E0ECFA', // 둥둥 몽상 — 몽롱한 블루
  FIEW: '#CFE3F8', // 다이빙 — 물속 코발트 틴트
  FIGR: '#FBF0C8', // 정원 — 볕 든 옐로
  FIGW: '#E3F0FB', // 나비 요정 — 옅은 하늘색
  TCER: '#FCEDC3', // 망원경 탐험 — 머스터드 옐로
  TCEW: '#D3DEF5', // 은하수 — 깊은 블루 틴트
  TCGR: '#DBE9F9', // 돋보기 연구 — 쿨 블루
  TCGW: '#FFE5CE', // 물음표 — 소프트 오렌지
  TIER: '#FFE2C6', // 책탑 나르기 — 활기찬 오렌지
  TIEW: '#FFDFC9', // 로켓 — 불꽃 오렌지 틴트
  TIGR: '#FFE8C9', // 매 사냥꾼 — 오커 오렌지
  TIGW: '#FFF1C6', // 안전모 건축 — 옐로
}

/** 위→아래로 표면색에 녹아드는 그라데이션 */
export function illustGradient(code: TypeCode): string {
  return `linear-gradient(to bottom, ${ILLUST_GRADIENT_TOP[code]}, var(--color-surface))`
}
