'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { loadPost, updatePost, isMyPost } from '@/entities/post/api/postsRemote'
import type { Post } from '@/entities/post/model/posts'
import { toast } from '@/shared/lib/toast'
import BackLink from '@/shared/ui/BackLink'
import PostForm from '@/features/post-compose/ui/PostForm'

export default function PostEditView() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  // null = 아직 확인 중, false = 없거나 남의 글
  const [post, setPost] = useState<Post | null | false>(null)

  useEffect(() => {
    async function load() {
      const found = await loadPost(id)
      if (!found || !(await isMyPost(found))) { setPost(false); return }
      setPost(found)
    }
    void load()
  }, [id])

  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href={`/posts/${id}`} />
          <span className="bj-h2">글 수정</span>
        </header>

        <div className="bj-content--lg">
          {post === null && <p className="bj-caption bj-text-muted">불러오는 중…</p>}
          {post === false && <p className="bj-body bj-text-muted">수정할 수 없는 글이에요</p>}
          {post && (
            <PostForm
              initialContent={post.content}
              initialBook={
                post.bookTitle
                  ? { title: post.bookTitle, isbn: post.bookIsbn, cover: post.bookCover }
                  : null
              }
              submitLabel="수정 완료"
              onSubmit={async ({ content, book }) => {
                const updated = await updatePost(post.id, { content, book })
                if (!updated) { toast.error('글을 수정하지 못했어요'); return }
                router.replace(`/posts/${post.id}`)
              }}
            />
          )}
        </div>
      </div>
    </main>
  )
}
