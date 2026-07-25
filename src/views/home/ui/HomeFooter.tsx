import { Logo } from '@/shared/ui'

/* 홈 푸터 — 로고 + 슬로건 + 정책 링크 자리 + 카피라이트.
   아래 항목들은 대응 라우트가 아직 없어 텍스트로만 둔다. 페이지가 생기면 Link로 교체. */

const FOOTER_LINKS = ['서비스 소개', '이용약관', '개인정보처리방침', '문의하기', '공지사항']

export default function HomeFooter() {
  return (
    <footer className="bj-footer">
      <Logo />
      <p className="bj-footer__tag" style={{ margin: 0 }}>읽는 취향이, 나를 만든다</p>
      <div className="bj-footer__links">
        {FOOTER_LINKS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <p className="bj-footer__copy" style={{ margin: 0 }}>
        북작(BOOKJAK) · 독서 취향 소셜
        <br />© 2026 BOOKJAK. All rights reserved.
      </p>
    </footer>
  )
}
