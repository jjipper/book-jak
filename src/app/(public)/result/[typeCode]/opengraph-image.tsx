import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from '@/app/og-card'

export const alt = '북작 독서 유형 결과'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ typeCode: string }> }) {
  const { typeCode } = await params
  const type = READING_TYPES[typeCode.toUpperCase() as TypeCode]

  if (!type) {
    return ogCard({
      emoji: '📚',
      title: '나의 독서 유형은?',
      subtitle: '12문항으로 알아보는 나의 독서 취향',
    })
  }

  return ogCard({
    emoji: type.emoji,
    title: type.name,
    subtitle: type.tagline,
    badge: `${type.code} · ${type.rarityText}`,
  })
}
