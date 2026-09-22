import { redirect } from 'next/navigation'

// 책 검색은 평가 탭 상단 검색창으로 합쳤다 — 홈 상단바 링크(/search)는 여기서 넘긴다.
// q가 빈 문자열이면 평가 탭이 검색창에 바로 포커스한다.
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams
  redirect(`/rate?q=${encodeURIComponent(typeof q === 'string' ? q : '')}`)
}
