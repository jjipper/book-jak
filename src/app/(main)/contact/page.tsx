import Link from 'next/link'

export default function ContactPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">문의하기</span>
        </header>

        <div className="bj-content--lg">
          <div className="bj-card">
            <p className="bj-h2 bj-mb-12">북작 팀에 문의해요</p>
            <p className="bj-body bj-text-muted">
              버그 제보, 서비스 제안, 기타 문의는<br />
              아래 이메일로 보내주시면 빠르게 답변드려요.
            </p>
          </div>

          <div className="bj-card--flat">
            <p className="bj-caption bj-bold bj-mb-8">이메일</p>
            <a
              href="mailto:jj.choi@sqisoft.com"
              className="bj-body bj-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              jj.choi@sqisoft.com
            </a>
          </div>

          <div className="bj-card--flat">
            <p className="bj-caption bj-bold bj-mb-8">문의 전 확인해주세요</p>
            <div className="bj-col-8">
              <p className="bj-caption">운영 시간: 평일 오전 10시 ~ 오후 6시</p>
              <p className="bj-caption">답변은 영업일 기준 1~3일 내 드려요</p>
              <p className="bj-caption">스팸·광고성 문의는 답변이 어려워요</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
