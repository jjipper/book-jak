'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BLIND_BOOKS } from '@/entities/blind-book/model/blindBooks'
import { loadAllAnswers, loadQuestion } from '@/entities/discussion/model/discussionActions'
import { loadMyComments } from '@/entities/post/api/commentsRemote'
import { getMyId } from '@/entities/user/model/profile'
import BackLink from '@/shared/ui/BackLink'

// 토론 답변과 피드 댓글을 한 줄 형태로 합쳐서 최신순 정렬
interface CommentRow {
  id: string
  label: string
  text: string
  href: string
  ts: number
}

function bookTitle(bookId: number | null): string {
  if (bookId === null) return '자유주제'
  return BLIND_BOOKS.find((b) => b.id === bookId)?.title ?? '자유주제'
}

export default function MyCommentsView() {
  const [rows, setRows] = useState<CommentRow[]>([])

  useEffect(() => {
    async function load() {
      const myId = getMyId()
      const [allAnswers, feedComments] = await Promise.all([loadAllAnswers(), loadMyComments()])
      const myAnswers = allAnswers.filter((a) => a.authorId === myId || a.authorId === 'me')

      const answerRows: CommentRow[] = []
      for (const a of myAnswers) {
        const q = await loadQuestion(a.questionId)
        answerRows.push({
          id: a.id,
          label: `의견 나누기 · ${bookTitle(q?.bookId ?? null)}`,
          text: a.text,
          href: `/social/discuss/${a.questionId}`,
          ts: a.ts,
        })
      }

      const commentRows: CommentRow[] = feedComments.map((c) => ({
        id: c.id,
        label: '피드 댓글',
        text: c.content,
        href: `/posts/${c.postId}`,
        ts: c.ts,
      }))

      setRows([...answerRows, ...commentRows].sort((a, b) => b.ts - a.ts))
    }
    void load()
  }, [])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
      <header className="bj-subpage-head">
        <BackLink href="/my" />
        <span className="bj-h2">남긴 댓글</span>
      </header>

      <div className="bj-content">
        {rows.length === 0 ? (
          <div className="bj-empty bj-card">
            <p className="bj-body bj-bold bj-mb-6">아직 남긴 댓글이 없어요</p>
            <Link href="/social/discuss" className="bj-btn bj-btn--primary bj-btn--cta">
              의견 나누기 보러가기
            </Link>
          </div>
        ) : (
          rows.map((r) => (
            <Link key={r.id} href={r.href} className="bj-row bj-row--top bj-unstyled-link">
              <div className="bj-flex-1">
                <p className="bj-caption bj-bold bj-mb-4">{r.label}</p>
                <p className="bj-body bj-body--sm">{r.text}</p>
              </div>
            </Link>
          ))
        )}
      </div>
      </div>
    </main>
  )
}
