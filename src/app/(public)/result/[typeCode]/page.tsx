import ResultDetailView from '@/views/result-detail/ui/ResultDetailView'

interface PageProps {
  params: Promise<{ typeCode: string }>
}

export default function Page({ params }: PageProps) {
  return <ResultDetailView params={params} />
}
