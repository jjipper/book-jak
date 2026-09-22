'use client'

// 책 상세 — 알라딘 책(isbn-...)만 존재한다.
// 목업 카탈로그(BOOKS)는 제거됐고, 책 메타데이터는 평가할 때 books 테이블에 upsert된다.

import { useParams } from 'next/navigation'
import ExternalBookDetail from '@/widgets/book/ExternalBookDetail'

export default function RateBookDetailView() {
  const params = useParams<{ id: string }>()
  return <ExternalBookDetail key={params.id} bookId={params.id} />
}
