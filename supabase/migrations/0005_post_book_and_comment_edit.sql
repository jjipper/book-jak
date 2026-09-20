-- 브랜치(worktree-home-posts-crud) 병합분에 필요한 스키마.
--
-- 1) 글에 책을 첨부한다 (표지·ISBN). 피드 카드에 표지가 뜨고, 상세에서 책으로 넘어간다.
-- 2) 글·댓글 수정 기능. updated_at이 있으면 '수정됨'으로 표시한다.
--
-- 댓글은 0003에서 만든 comments 테이블을 그대로 쓴다.
-- (브랜치에 있던 post_comments 테이블은 채택하지 않았다 — 같은 걸 두 번 만들 이유가 없다)

-- ── 1. 글에 첨부한 책 ────────────────────────────────────────
alter table public.posts add column if not exists book_isbn text;
alter table public.posts add column if not exists book_cover text;

-- ── 2. 글 수정 ───────────────────────────────────────────────
alter table public.posts add column if not exists updated_at timestamptz;

drop policy if exists "posts: 본인만 수정" on public.posts;
create policy "posts: 본인만 수정" on public.posts
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- ── 3. 댓글 수정 ─────────────────────────────────────────────
alter table public.comments add column if not exists updated_at timestamptz;

drop policy if exists "comments: 본인만 수정" on public.comments;
create policy "comments: 본인만 수정" on public.comments
  for update to authenticated
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);
