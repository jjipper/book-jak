import { READING_TYPES, type TypeCode } from '@/entities/reading-type/model/readingTypes'
import { ogInviteCard, OG_SIZE, OG_CONTENT_TYPE } from '@/app/og-card'

export const alt = '북작 — 나랑 독서 궁합 볼래?'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({ params }: { params: Promise<{ typeCode: string }> }) {
  const type = READING_TYPES[(await params).typeCode.toUpperCase() as TypeCode]
  return ogInviteCard(type ? { emoji: type.emoji, name: type.name, code: type.code } : { emoji: '📚', name: '독서가', code: 'BOOKBTI' })
}
