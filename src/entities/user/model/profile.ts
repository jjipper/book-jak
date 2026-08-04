// 닉네임·프로필 사진의 로컬 캐시 (AuthProvider가 Supabase에서 받아 여기에 세팅)

const STORAGE_KEY = 'book_nickname'
const AVATAR_KEY = 'book_avatar'

export function getNickname(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function setNickname(name: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, name.trim())
}

// Supabase profiles 기반 — 캐시 미스 시 빈 문자열 반환 (자동 생성 없음)
export function ensureNickname(): string {
  return getNickname() ?? ''
}

export function getAvatar(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AVATAR_KEY)
}

export function setAvatar(dataUrl: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AVATAR_KEY, dataUrl)
}

