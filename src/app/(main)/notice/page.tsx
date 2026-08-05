import Link from 'next/link'

export default function NoticePage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">공지사항</span>
        </header>
        <div className="bj-content--lg">
          <div className="bj-card--flat bj-text-center">
            <p className="bj-body bj-bold bj-mb-8">아직 공지사항이 없어요</p>
            <p className="bj-caption bj-text-muted">새로운 소식이 생기면 여기서 알려드릴게요</p>
          </div>
        </div>
      </div>
    </main>
  )
}
