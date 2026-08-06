import Link from 'next/link'

export default function NotificationsView() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <Link href="/home" className="bj-icon-btn">←</Link>
          <span className="bj-display bj-display--lg">알림</span>
        </header>

        <div className="bj-content--lg">
          <div className="bj-card bj-text-center">
            <p className="bj-h2 bj-mb-10">알림 기능 준비 중이에요</p>
            <p className="bj-body bj-text-muted">
              팔로우, 좋아요, 댓글 알림이<br />곧 여기에 쌓여요
            </p>
          </div>

          <div className="bj-col-10">
            <div className="bj-card--flat">
              <p className="bj-caption bj-bold bj-mb-10">이런 알림이 올 예정이에요</p>
              <div className="bj-col-8">
                <p className="bj-caption">누군가 나를 팔로우했어요</p>
                <p className="bj-caption">내 질문에 답변이 달렸어요</p>
                <p className="bj-caption">내 글에 좋아요가 생겼어요</p>
                <p className="bj-caption">모임에 새 소식이 있어요</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
