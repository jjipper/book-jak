'use client'

import { useSyncExternalStore } from 'react'

const subscribe = () => () => {}
const getSnapshot = () => true
const getServerSnapshot = () => false

/**
 * 하이드레이션이 끝났는지. 서버·첫 렌더에서 false, 마운트 후 true.
 *
 * localStorage처럼 클라이언트에만 있는 값은 첫 렌더에서 읽으면 하이드레이션이 어긋난다.
 * useEffect + setState로 늦게 채우면 렌더가 한 번 더 도는데, 이 훅으로 분기하면
 * 렌더 중에 바로 파생시킬 수 있다.
 *
 *   const mounted = useMounted()
 *   const items = useMemo(() => (mounted ? loadItems() : []), [mounted])
 */
export function useMounted(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
