export default function SocialPage() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '52px 20px 16px' }}>
        <span className="bj-display bj-display--lg">소셜</span>
      </header>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <p className="bj-h1" style={{ marginBottom: 10 }}>독서 모임 & 랭킹</p>
          <p className="bj-body" style={{ color: 'var(--color-text-muted)' }}>
            책 모임 만들기, 취향 맞는 사람 찾기,<br />랭킹. Phase 3에서 오픈됩니다.
          </p>
        </div>
        <span className="bj-badge bj-badge--common">준비 중</span>
      </div>
    </main>
  )
}
