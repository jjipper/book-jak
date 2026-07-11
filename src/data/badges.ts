// 진단 테스트 4지선다 C·D 옵션에서 수집되는 배지 카탈로그
// questions.ts에 실재하는 12개 badgeKey 전체를 커버한다 (예전엔 8개만 등록돼 4개가 누락돼 있었음)

export interface Badge {
  key: string
  name: string
  desc: string
}

export const BADGE_LIST: Badge[] = [
  { key: 'bookmark-prisoner', name: '책갈피 수감자', desc: '읽다 멈추기 반복' },
  { key: 'daydream-reader', name: '몽상 독서가', desc: '읽는 척 딴생각' },
  { key: 'interrupted-thinker', name: '방해 환영러', desc: '말 걸림이 오히려 생각 자극' },
  { key: 'reluctant-reader', name: '휴식 반가움러', desc: '방해를 휴식 기회로 씀' },
  { key: 'selective-reader', name: '취사선택 리더', desc: '흥미로운 부분만 속독' },
  { key: 'slow-deep-diver', name: '슬로우 다이버', desc: '한 권에 몇 달' },
  { key: 'mood-reader', name: '무드 리더', desc: '분위기로 책 고름' },
  { key: 'reluctant-grower', name: '얼결에 성장러', desc: '추천받았다가 뜻밖의 변화' },
  { key: 'knowledge-hunter', name: '지식 수집가', desc: '지식 위주 독서' },
  { key: 'genre-nomad', name: '장르 유목민', desc: '장르 안 가림' },
  { key: 'worldbuilder-fan', name: '세계관 팬', desc: '설정집까지 읽음' },
  { key: 'character-first', name: '캐릭터 퍼스트', desc: '인물이 최우선' },
]
