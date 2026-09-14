/* 유형 배지 TypeBadge — 독서 유형 코드 pill. 코드 텍스트만 Wildgak 허용 대상 */

export default function TypeBadge({ code }: { code: string | null }) {
  if (!code) return null
  return (
    <span className="bj-type-badge" title={code}>
      {code}
    </span>
  )
}
