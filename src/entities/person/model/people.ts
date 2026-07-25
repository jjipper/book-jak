// Phase 3~5 — 소셜 전반(취향 찾기·토론·모임·랭킹)에서 공유하는 목업 사용자
// 실서비스에서는 서버에서 내려오는 다른 사용자 데이터. 현재는 고정 목업.

import type { TypeCode } from '@/entities/reading-type/model/readingTypes'

export interface MockPerson {
  id: string
  nickname: string
  typeCode: TypeCode
  bio: string
  favoriteTags: string[]
  score: number
  followingCount: number
  followerCount: number
  badgeKeys: string[]
  favoriteBookIds: number[]
}

export const MOCK_PEOPLE: MockPerson[] = [
  { id: 'p01', nickname: '새벽세시', typeCode: 'FIEW', bio: '판타지 아니면 안 읽음. 완결까지 밤새는 편.', favoriteTags: ['판타지', '몰입감', '세계관'], score: 132, followingCount: 48, followerCount: 210, badgeKeys: ['slow-deep-diver', 'worldbuilder-fan'], favoriteBookIds: [1, 4] },
  { id: 'p02', nickname: '눈물버튼', typeCode: 'FIER', bio: '에세이 읽고 지하철에서 운 적 3번.', favoriteTags: ['위로', '에세이', '공감'], score: 87, followingCount: 32, followerCount: 96, badgeKeys: ['mood-reader', 'reluctant-grower'], favoriteBookIds: [3, 1] },
  { id: 'p03', nickname: '밑줄장인', typeCode: 'FCGR', bio: '한 문장에 30분씩 머무는 타입.', favoriteTags: ['잔잔함', '문장수집', '필사'], score: 64, followingCount: 19, followerCount: 58, badgeKeys: ['slow-deep-diver', 'character-first'], favoriteBookIds: [1, 3] },
  { id: 'p04', nickname: '책장부자', typeCode: 'TIGR', bio: '사는 게 반, 읽는 게 반. 안 읽어도 뿌듯함.', favoriteTags: ['자기계발', '정보', '스테디셀러'], score: 145, followingCount: 61, followerCount: 340, badgeKeys: ['knowledge-hunter', 'genre-nomad'], favoriteBookIds: [4, 3] },
  { id: 'p05', nickname: '속독머신', typeCode: 'TIER', bio: '연간 40권, 내용은 잘 기억 안 남.', favoriteTags: ['스릴러', '속도감', '다독'], score: 118, followingCount: 44, followerCount: 188, badgeKeys: ['selective-reader', 'genre-nomad'], favoriteBookIds: [2, 4] },
  { id: 'p06', nickname: '우주설계자', typeCode: 'TCEW', bio: '책 한 권 읽고 사흘 동안 딴생각함.', favoriteTags: ['철학', '사고실험', 'SF'], score: 41, followingCount: 12, followerCount: 30, badgeKeys: ['worldbuilder-fan', 'knowledge-hunter'], favoriteBookIds: [5, 4] },
  { id: 'p07', nickname: '질문쟁이', typeCode: 'TCGW', bio: '열린 결말 좋아함. 답 주는 책은 재미없음.', favoriteTags: ['열린결말', '토론', '단편집'], score: 96, followingCount: 28, followerCount: 102, badgeKeys: ['interrupted-thinker', 'reluctant-grower'], favoriteBookIds: [5, 2] },
  { id: 'p08', nickname: '해부학자', typeCode: 'TCGR', bio: '재밌게 읽다가 결국 분석해버림.', favoriteTags: ['비평', '논픽션', '토론'], score: 103, followingCount: 35, followerCount: 140, badgeKeys: ['knowledge-hunter', 'character-first'], favoriteBookIds: [4, 5] },
  { id: 'p09', nickname: '동화수집가', typeCode: 'FCGW', bio: '그림책 코너에서 못 나옴. 동화가 제일 잔인함.', favoriteTags: ['동화', '우화', '감동'], score: 29, followingCount: 9, followerCount: 21, badgeKeys: ['mood-reader', 'daydream-reader'], favoriteBookIds: [3, 1] },
  { id: 'p10', nickname: '설계충동', typeCode: 'TIGW', bio: '영감 받으면 바로 노트북 켜는 타입.', favoriteTags: ['SF', '아이디어', '미래'], score: 58, followingCount: 21, followerCount: 47, badgeKeys: ['worldbuilder-fan', 'knowledge-hunter'], favoriteBookIds: [5, 4] },
  { id: 'p11', nickname: '관찰자모드', typeCode: 'TCER', bio: '감정이입보다 관찰이 편함.', favoriteTags: ['사회학', '관찰', '냉정함'], score: 18, followingCount: 6, followerCount: 14, badgeKeys: ['selective-reader', 'interrupted-thinker'], favoriteBookIds: [4, 2] },
  { id: 'p12', nickname: '몽상러', typeCode: 'FCEW', bio: '책 펴놓고 딴생각하다 페이지 놓침.', favoriteTags: ['분위기', '시집', '여백'], score: 73, followingCount: 26, followerCount: 68, badgeKeys: ['daydream-reader', 'bookmark-prisoner'], favoriteBookIds: [3, 5] },
]
