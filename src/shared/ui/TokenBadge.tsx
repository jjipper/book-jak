import Icon from './Icon'

/* 토큰 배지 TokenBadge — pill 30 · 주황100 · 코인 아이콘(책 든 동전) 20 + 개수 14 Bold */

export default function TokenBadge({ count }: { count: number }) {
  return (
    <span className="bj-token-badge" aria-label={`토큰 ${count}개`}>
      <Icon name="coin" size={20} />
      {count}
    </span>
  )
}
