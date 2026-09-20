import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

/** 서버가 이 시간 안에 답하지 않으면 로컬 폴백으로 넘어간다 */
const REMOTE_TIMEOUT_MS = 3000

/**
 * Supabase 호출을 감싸 실패·무응답을 모두 null로 눕힌다.
 *
 * 두 가지를 다 막아야 폴백이 폴백 구실을 한다:
 * - supabase-js는 쿼리 오류는 `{ error }`로 돌려주지만 서버가 안 뜨거나 CORS가 막히면 throw한다.
 * - `auth.getUser()`는 프로젝트가 죽어 있으면 아예 응답을 안 주고 매달린다. 이때 예외가 없어서
 *   try/catch로는 못 잡고, 그 await 뒤 코드가 통째로 멈춘다 (댓글이 영영 안 뜨던 원인).
 *
 * ponytail: 고정 타임아웃. 재시도·백오프가 필요해지면 그때 얹는다.
 */
export async function tryRemote<T>(run: () => Promise<T>): Promise<T | null> {
  try {
    return await Promise.race([
      run(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), REMOTE_TIMEOUT_MS)),
    ])
  } catch {
    return null
  }
}
