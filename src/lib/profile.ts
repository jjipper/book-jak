// Phase 4/5 — 로컬 닉네임·프로필 사진 (localStorage 임시, 인증 없음)

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

const NICKNAME_ADJECTIVES = [
  '새벽', '책장', '밑줄', '몽상', '속독', '완독', '표지', '서재', '문장', '필사', '북마크', '활자',
]
const NICKNAME_NOUNS = [
  '수집가', '탐험가', '중독자', '지킴이', '요정', '고양이', '작가', '독서가', '여행자', '기록자', '수감자', '실종자',
]

// 설정 안 한 사용자에게 붙여줄 책 관련 랜덤 닉네임 (매 호출 시 새로 뽑음)
export function randomNickname(): string {
  const a = NICKNAME_ADJECTIVES[Math.floor(Math.random() * NICKNAME_ADJECTIVES.length)]
  const n = NICKNAME_NOUNS[Math.floor(Math.random() * NICKNAME_NOUNS.length)]
  return `${a}${n}`
}

// 닉네임이 없으면 랜덤 생성해서 저장까지 하고 반환 (있으면 그대로 반환)
export function ensureNickname(): string {
  const existing = getNickname()
  if (existing) return existing
  const generated = randomNickname()
  setNickname(generated)
  return generated
}

export function getAvatar(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AVATAR_KEY)
}

export function setAvatar(dataUrl: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(AVATAR_KEY, dataUrl)
}

export function clearAvatar(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(AVATAR_KEY)
}
