/* 00. LOGO — "북작" 워드마크 (Wildgak 허용 대상) */

interface LogoProps {
  /** 주황 * 마크 표시 여부 */
  mark?: boolean
  /** 리소 미스레지스트레이션 마크 (문서 5번 시그니처) — 화면당 1회만 사용 */
  riso?: boolean
}

export default function Logo({ mark = true, riso = false }: LogoProps) {
  return (
    <span className="bj-logo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {riso && (
        <span className="bj-riso" style={{ width: 22, height: 22 }} aria-hidden="true">
          <span className="bj-riso__a" />
          <span className="bj-riso__b" />
        </span>
      )}
      <span>
        북작
        {mark && !riso && (
          <span className="bj-logo__mark" aria-hidden="true">
            *
          </span>
        )}
      </span>
    </span>
  )
}
