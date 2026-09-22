import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MatchInviteView from '@/views/result-compare/ui/MatchInviteView'
import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'

interface PageProps {
  params: Promise<{ typeCode: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const type = READING_TYPES[(await params).typeCode.toUpperCase() as TypeCode]
  if (!type) return { title: '독서 궁합' }

  const title = `${type.emoji} ${type.name} 친구가 독서 궁합을 보자고 해요`
  const description = '나랑 독서 궁합 볼래? 12문항 BOOKBTI 테스트하고 바로 궁합 확인하기'
  const url = `/match/${type.code}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
  }
}

export default async function Page({ params }: PageProps) {
  const code = (await params).typeCode.toUpperCase() as TypeCode
  if (!READING_TYPES[code]) notFound()
  return <MatchInviteView typeCode={code} />
}
