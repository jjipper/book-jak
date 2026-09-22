import RateView from '@/views/rate/ui/RateView'

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const { q } = await searchParams
  return <RateView initialQuery={typeof q === 'string' ? q : undefined} />
}
