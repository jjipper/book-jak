// 읽고싶어요 (Supabase wishlist) — 원본 데이터는 여기에 있다. 로그인 필수.
// 화면이 동기로 읽는 localStorage 사본은 model/wishlist.ts의 syncWishlist()가 맞춘다.

import { createSupabaseBrowser } from '@/shared/api/supabase-browser'
import type { WishlistRecord } from '@/features/wishlist/model/wishlist'

async function myUserId(): Promise<string | null> {
  const { data: { user } } = await createSupabaseBrowser().auth.getUser()
  return user?.id ?? null
}

// 내 찜 목록 — 로그인 안 했거나 실패하면 null (로컬 사본을 건드리지 않게)
export async function fetchWishlist(): Promise<WishlistRecord[] | null> {
  const userId = await myUserId()
  if (!userId) return null
  const { data, error } = await createSupabaseBrowser()
    .from('wishlist')
    .select('book_id, title, author, publisher, cover, illust_code, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error || !data) return null
  return data.map((r) => ({
    bookId: r.book_id,
    title: r.title,
    author: r.author ?? undefined,
    publisher: r.publisher ?? undefined,
    cover: r.cover ?? undefined,
    illustCode: r.illust_code ?? undefined,
    ts: new Date(r.created_at).getTime(),
  }))
}

// 여러 건을 한 번에 업서트 (이미 있으면 무시)
export async function pushWishlist(records: WishlistRecord[]): Promise<void> {
  const userId = await myUserId()
  if (!userId) throw new Error('로그인이 필요해요')
  const { error } = await createSupabaseBrowser()
    .from('wishlist')
    .upsert(
      records.map((r) => ({
        user_id: userId,
        book_id: r.bookId,
        title: r.title,
        author: r.author ?? null,
        publisher: r.publisher ?? null,
        cover: r.cover ?? null,
        illust_code: r.illustCode ?? null,
        created_at: new Date(r.ts).toISOString(),
      })),
      { onConflict: 'user_id,book_id', ignoreDuplicates: true },
    )
  if (error) throw new Error(error.message)
}

export async function deleteWishlist(bookId: string): Promise<void> {
  const userId = await myUserId()
  if (!userId) return
  const { error } = await createSupabaseBrowser().from('wishlist').delete().eq('user_id', userId).eq('book_id', bookId)
  if (error) throw new Error(error.message)
}
