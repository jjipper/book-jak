import type { Metadata } from 'next'
import Link from 'next/link'
import BackLink from '@/shared/ui/BackLink'

export const metadata: Metadata = {
  title: '서비스 소개',
  description: '북작은 책을 통해 취향과 생각이 연결되는 독서 취향 소셜입니다.',
}

const MENUS: { name: string; desc: string }[] = [
  { name: '홈', desc: 'BOOKBTI 테스트로 시작해서, 책 좋아하는 사람들과 자유롭게 머무는 피드' },
  { name: '발견', desc: '제목과 표지를 가린 블라인드 북. 편견 없이 요약과 핵심만 보고 고르기' },
  { name: '평가', desc: '읽은 책에 별점과 한줄평을 남기고, 그 기록으로 취향이 쌓이는 곳' },
  { name: '모임', desc: '가볍게 참여하는 모임부터 직접 여는 모임까지' },
  { name: '마이', desc: '유형 테스트와 평가 기록으로 보는 나의 취향 분석과 뱃지' },
]

export default function AboutPage() {
  return (
    <main className="bj-shell">
      <div className="bj-frame">
        <header className="bj-subpage-head">
          <BackLink href="/home" />
          <span className="bj-h2">서비스 소개</span>
        </header>
        <div className="bj-content--lg">
          <div className="bj-card">
            <p className="bj-h1 bj-mb-12">북작(BOOKJAK)</p>
            <p className="bj-body bj-text-muted bj-mb-16">취향으로 북적이는 독서 취향 소셜</p>
            <p className="bj-body">
              책은 많은데 &lsquo;왜 이 책인지&rsquo;는 늘 흐릿해요. 북작은 책이 아니라 책을 읽는 사람의
              취향과 생각을 데이터로 만들어서, 나를 더 알고 비슷한 사람과 이어지게 해요.
            </p>
          </div>

          <div className="bj-card">
            <p className="bj-h2 bj-mb-12">16가지 BOOKBTI</p>
            <div className="bj-col-10">
              <p className="bj-caption">감정형(F) / 사유형(T) — 느끼려 읽는지, 생각하려 읽는지</p>
              <p className="bj-caption">몰입형(I) / 사색형(C) — 빠져드는지, 곱씹는지</p>
              <p className="bj-caption">도피형(E) / 성장형(G) — 벗어나려 읽는지, 변하려 읽는지</p>
              <p className="bj-caption">현실형(R) / 환상형(W) — 실제 세계인지, 상상 세계인지</p>
              <p className="bj-caption bj-text-muted bj-mt-8">
                네 축을 조합해 16가지 유형이 나와요. 심리 검사가 아니라 취향을 가볍게 살펴보는 재미 요소예요.
              </p>
            </div>
          </div>

          <div className="bj-card">
            <p className="bj-h2 bj-mb-12">이런 걸 할 수 있어요</p>
            <div className="bj-col-12">
              {MENUS.map((menu) => (
                <div key={menu.name}>
                  <p className="bj-body bj-bold bj-mb-2">{menu.name}</p>
                  <p className="bj-caption bj-text-muted">{menu.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bj-card">
            <p className="bj-h2 bj-mb-12">데이터 출처</p>
            <div className="bj-col-10">
              <p className="bj-caption">도서 DB 제공: 알라딘 인터넷서점(www.aladin.co.kr)</p>
              <p className="bj-caption">
                유형 희소도는 2025년 국민독서실태조사(문화체육관광부)의 응답 비율 방향성을 참고하되, 세부 수치는
                재미를 위해 설계한 값이에요.
              </p>
            </div>
          </div>

          <div className="bj-card--flat">
            <div className="bj-col-8">
              <Link href="/terms" className="bj-body bj-text-action">이용약관</Link>
              <Link href="/privacy" className="bj-body bj-text-action">개인정보처리방침</Link>
              <Link href="/contact" className="bj-body bj-text-action">문의하기</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
