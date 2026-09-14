'use client'

import { useRouter } from 'next/navigation'
import { createPost } from '@/entities/post/api/postsRemote'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'
import PostForm from '@/features/post-compose/ui/PostForm'

export default function PostNewView() {
  const router = useRouter()

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">글 쓰기</span>
        </header>

        <div className="bj-content--lg">
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
        </div>
      </div>
    </main>
  )
}
