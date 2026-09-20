import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <div className="bj-content--lg bj-pad-v-lg bj-text-center">
          <p className="bj-display--lg bj-mb-12">404</p>
          <p className="bj-body bj-mb-8">찾는 페이지가 없어요</p>
          <p className="bj-caption bj-text-muted bj-mb-20">주소가 바뀌었거나 사라진 페이지예요</p>
          <Link href="/home" className="bj-btn bj-btn--primary bj-btn--block">
            홈으로 가기
          </Link>
        </div>
      </div>
    </main>
  )
}
