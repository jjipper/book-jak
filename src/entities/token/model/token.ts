// 토큰 — 활동으로 모으고 블라인드 북 공개에 1개씩 쓴다. 지급·차감은 전부 DB(0014_tokens.sql)가 한다.

export const REVEAL_COST = 1

export const TOKEN_EARN_WAYS = ['출석하면 하루 1개', '글을 1개 쓰면 하루 1개', '댓글을 2개 쓰면 하루 1개']

/** 잔액이 바뀌었을 때(출석 지급 등) 보고 있는 화면이 다시 읽도록 알리는 window 이벤트 */
export const TOKENS_CHANGED = 'bj:tokens-changed'
