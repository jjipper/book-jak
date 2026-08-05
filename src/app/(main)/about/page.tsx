import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">서비스 소개</span>
        </header>
        <div className="bj-content--lg">
          <div className="bj-card">
            <p className="bj-h1 bj-mb-12">북작(BOOKJAK)</p>
            <p className="bj-body bj-text-muted">취향으로 북적이는 독서 취향 소셜</p>
            <p className="bj-body bj-mt-16">
              북작은 책을 통해 나의 취향과 생각이 연결되는 취향 기반 독서 소셜 플랫폼이에요.
              16가지 독서 유형 테스트로 나를 알아가고, 비슷한 취향의 독자들과 연결되어 보세요.
            </p>
          </div>
          <div className="bj-card--flat bj-text-center">
            <p className="bj-caption bj-text-muted">더 자세한 소개 페이지 준비 중이에요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
