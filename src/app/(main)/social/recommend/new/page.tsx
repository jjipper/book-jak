import RecommendNewView from '@/views/recommend-new/ui/RecommendNewView'

export default async function Page({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams
  return <RecommendNewView kind={kind === 'share' ? 'share' : 'ask'} />
}
