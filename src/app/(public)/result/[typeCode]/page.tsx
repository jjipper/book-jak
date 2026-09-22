import type { Metadata } from 'next'
import ResultDetailView from '@/views/result-detail/ui/ResultDetailView'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'

interface PageProps {
  params: Promise<{ typeCode: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { typeCode } = await params
  const type = READING_TYPES[typeCode.toUpperCase() as TypeCode]

  if (!type) {
    return { title: 'BOOKBTI 결과', description: '12문항으로 알아보는 나의 독서 유형 BOOKBTI' }
  }

  const title = `${type.emoji} ${type.name}`
  const description = `${type.tagline} · ${type.rarityText}`
  const url = `/result/${type.code}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} — 나의 BOOKBTI`, description, url, type: 'article' },
    twitter: { card: 'summary_large_image', title: `${title} — 나의 BOOKBTI`, description },
  }
}

export default function Page({ params }: PageProps) {
  return <ResultDetailView params={params} />
}
