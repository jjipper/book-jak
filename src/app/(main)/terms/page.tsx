import BackLink from '@/shared/ui/BackLink'

export default function TermsPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">이용약관</span>
        </header>
        <div className="bj-content--lg">
          <div className="bj-card--flat bj-text-center">
            <p className="bj-body bj-bold bj-mb-8">이용약관 준비 중이에요</p>
            <p className="bj-caption bj-text-muted">곧 업데이트될 예정이에요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
