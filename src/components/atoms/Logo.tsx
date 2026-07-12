/* 00. LOGO — "북작" 워드마크 (Wildgak 허용 대상) */

interface LogoProps {
  /** 주황 * 마크 표시 여부 */
  mark?: boolean
}

export default function Logo({ mark = true }: LogoProps) {
  return (
    <span className="bj-logo">
      북작
      {mark && (
        <span className="bj-logo__mark" aria-hidden="true">
          *
        </span>
      )}
    </span>
  )
}
