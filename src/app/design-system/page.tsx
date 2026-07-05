const sectionLabel: React.CSSProperties = {
  fontSize: 12,
  letterSpacing: '1.5px',
  color: 'var(--color-text-hint)',
  fontWeight: 500,
  marginBottom: 12,
  textTransform: 'uppercase',
}

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }
const stack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }

export default function DesignSystemPreviewPage() {
  return (
    <main style={{ maxWidth: 520, margin: '0 auto', padding: '32px 20px 64px' }}>

      {/* 로고 + 시그니처 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...row, alignItems: 'flex-end' }}>
          <span className="bj-riso" style={{ width: 36, height: 36 }}>
            <span className="bj-riso__a" style={{ width: 36, height: 36, background: 'var(--color-action)' }} />
            <span className="bj-riso__b" style={{ width: 36, height: 36, background: 'var(--p-riso-blue)' }} />
          </span>
          <span className="bj-display bj-display--xl">북작</span>
          <span className="bj-caption" style={{ marginBottom: 4 }}>취향으로 북적이는 곳</span>
        </div>
      </div>

      {/* 결과 카드 예시 */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>결과 카드 (조합 예시)</p>
        <div className="bj-card">
          <div style={{ ...row, justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="bj-display bj-display--lg">프로 잠수부</div>
              <div className="bj-caption" style={{ marginTop: 2 }}>책 펴는 순간 현실에서 잠수 탐. 호출 금지.</div>
            </div>
            <span className="bj-badge bj-badge--rare">희귀 4.1%</span>
          </div>

          <div className="bj-illust" style={{ height: 120, margin: '16px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="bj-caption">캐릭터 일러스트 자리 (형광 리소 3색)</span>
          </div>

          <div style={stack}>
            <div className="bj-stat">
              <div className="bj-stat__head"><span>몰입력</span><span className="bj-stat__value">92</span></div>
              <div className="bj-stat__track"><div className="bj-stat__fill" style={{ width: '92%' }} /></div>
            </div>
            <div className="bj-stat">
              <div className="bj-stat__head"><span>허세력</span><span className="bj-stat__value">34</span></div>
              <div className="bj-stat__track"><div className="bj-stat__fill" style={{ width: '34%' }} /></div>
            </div>
          </div>

          <button className="bj-btn bj-btn--primary bj-btn--block" style={{ marginTop: 16 }}>결과 공유</button>
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>버튼</p>
        <div style={row}>
          <button className="bj-btn bj-btn--primary">테스트 시작</button>
          <button className="bj-btn">더 보기</button>
          <button className="bj-btn bj-btn--ghost">건너뛰기</button>
        </div>
      </div>

      {/* 뱃지 */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>희소도 뱃지</p>
        <div style={row}>
          <span className="bj-badge bj-badge--common">흔함 9.4%</span>
          <span className="bj-badge bj-badge--rare">희귀 4.1%</span>
          <span className="bj-badge bj-badge--epic">최희귀 2.1%</span>
        </div>
      </div>

      {/* 진단 선택지 */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>진단 선택지</p>
        <div style={stack}>
          <button className="bj-choice is-active">A. 끝까지 못 참고 몰입한다</button>
          <button className="bj-choice">B. 곱씹으며 천천히 읽는다</button>
          <button className="bj-choice">C. 읽다 놓고 못 읽는다</button>
        </div>
      </div>

      {/* 타이포 스케일 */}
      <div style={{ marginBottom: 32 }}>
        <p style={sectionLabel}>타이포 스케일</p>
        <div style={stack}>
          <div className="bj-h1">bj-h1 · 섹션 제목</div>
          <div className="bj-h2">bj-h2 · 소제목</div>
          <p className="bj-body">bj-body · 본문 텍스트입니다. Pretendard로 렌더링됩니다.</p>
          <p className="bj-caption">bj-caption · 부가 정보 텍스트</p>
        </div>
      </div>
    </main>
  )
}
