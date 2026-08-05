import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">개인정보처리방침</span>
        </header>
        <div className="bj-content--lg">
          <div className="bj-card--flat bj-text-center">
            <p className="bj-body bj-bold bj-mb-8">개인정보처리방침 준비 중이에요</p>
            <p className="bj-caption bj-text-muted">곧 업데이트될 예정이에요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
