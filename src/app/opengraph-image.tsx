import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from './og-card'

export const alt = '북작 — 나의 독서 유형 BOOKBTI는?'
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default function Image() {
  return ogCard({
    emoji: '📚',
    title: '나의 BOOKBTI는?',
    subtitle: '12문항으로 알아보는 나의 독서 취향. 16가지 중 나는?',
  })
}
