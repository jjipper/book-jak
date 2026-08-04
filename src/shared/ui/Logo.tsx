/* 00. LOGO — "북작" 워드마크 (Wildgak 허용 대상) */

interface LogoProps {
  /** 주황 * 마크 표시 여부 */
  mark?: boolean
  /** 리소 미스레지스트레이션을 * 마크에 적용 (문서 5번 시그니처) — 화면당 1회만 사용 */
  riso?: boolean
}

export default function Logo({ mark = true, riso = false }: LogoProps) {
  return (
    <span className="bj-logo">
      <span>
        북작
        {mark &&
          (riso ? (
            <span className="bj-riso-star" aria-hidden="true">
              <span className="bj-riso-star__a">*</span>
              <span className="bj-riso-star__b">*</span>
            </span>
          ) : (
            <span className="bj-logo__mark" aria-hidden="true">
              *
            </span>
          ))}
      </span>
    </span>
  )
}
