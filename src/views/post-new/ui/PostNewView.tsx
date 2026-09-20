'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createPost } from '@/entities/post/api/postsRemote'
import { useAuthGate } from '@/shared/lib/useAuthGate'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'
import LoginGateSheet from '@/shared/ui/LoginGateSheet'
import PostForm from '@/features/post-compose/ui/PostForm'

export default function PostNewView() {
  const router = useRouter()
  // URL로 바로 들어오는 경우가 있어 화면 진입 시점에 막는다 — 다 쓰고 나서 막으면 글이 날아간다
  const { showGate, closeGate, requireAuth } = useAuthGate()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    void requireAuth(() => setAllowed(true))
  }, [requireAuth])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">글 쓰기</span>
        </header>

        <div className="bj-content--lg">
          {allowed ? (
            <PostForm
              submitLabel="올리기"
              onSubmit={async ({ content, book }) => {
                try {
                  const post = await createPost({ content, book })
                  router.replace(`/posts/${post.id}`)
                } catch {
                  toast.error('글을 올리지 못했어요')
                }
              }}
            />
          ) : (
            <p className="bj-caption bj-text-muted">로그인하면 글을 쓸 수 있어요</p>
          )}
        </div>
      </div>

      <LoginGateSheet open={showGate} onClose={closeGate} next="/posts/new" />
    </main>
  )
}
