import BackLink from '@/shared/ui/BackLink'

export default function ContactPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">문의하기</span>
        </header>

        <div className="bj-content--lg">
          <div className="bj-card">
            <p className="bj-h2 bj-mb-12">북작 팀에 문의해요</p>
            <p className="bj-body bj-text-muted">
              버그 제보, 서비스 제안, 기타 문의는<br />
              아래 GitHub 이슈로 남겨주시면 빠르게 답변드려요.
            </p>
          </div>

          <div className="bj-card--flat">
            <p className="bj-caption bj-bold bj-mb-8">GitHub 이슈</p>
            <a
              href="https://github.com/jjipper/book-jak/issues"
              target="_blank"
              rel="noreferrer"
              className="bj-body bj-bold"
              style={{ color: 'var(--color-accent)' }}
            >
              github.com/jjipper/book-jak/issues
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
