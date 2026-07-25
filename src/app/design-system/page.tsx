'use client'

import { useState } from 'react'
import {
  BottomNav,
  Button,
  Callout,
  Card,
  Check,
  Chip,
  IconButton,
  Input,
  Logo,
  NavItem,
  Option,
  Progress,
  RarityBadge,
  RarityTag,
  Row,
  SectionLabel,
  Segmented,
  Sheet,
  StatBar,
  Textarea,
  Toggle,
} from '@/shared/ui'

/* STEP 1 아토믹 컴포넌트 갤러리 (승인용 미리보기)
   화면 조합 아님 — 각 단위를 독립 전시. 인라인 스타일은 갤러리 배치 전용. */

const sectionLabel: React.CSSProperties = {
  fontSize: 'var(--fs-caption)',
  letterSpacing: '1.5px',
  color: 'var(--color-text-caption)',
  fontWeight: 500,
  margin: '0 0 12px',
  textTransform: 'uppercase',
}

const row: React.CSSProperties = { display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }
const stack: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 10 }
const grid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: 24,
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p style={sectionLabel}>{title}</p>
      {children}
    </section>
  )
}

const HeartIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const BookIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

const MoonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const BookmarkIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const UsersIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const CommentIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
)

const SearchIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
)

const HomeIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const StarIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.63 22 9.27 16.5 13.97 18.18 21 12 17.27 5.82 21 7.5 13.97 2 9.27 8.91 8.63 12 2" />
  </svg>
)

const UserIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

export default function DesignSystemPreviewPage() {
  const [selected, setSelected] = useState('D')
  const [toggleOn, setToggleOn] = useState(true)
  const [checked, setChecked] = useState(true)
  const [activeChip, setActiveChip] = useState('보관함')
  const [activeNav, setActiveNav] = useState('홈')
  const [sheetOpen, setSheetOpen] = useState(false)

  const chips = [
    { label: '몰입수집가', icon: BookIcon },
    { label: '밤독서파', icon: MoonIcon },
    { label: '추리소설', icon: SearchIcon },
    { label: '보관함', icon: BookmarkIcon },
  ]

  return (
    <main className="bj-shell" style={{ paddingTop: 32, paddingBottom: 64 }}>
      <header style={{ marginBottom: 32 }}>
        <Logo />
        <p className="bj-caption" style={{ margin: '4px 0 0' }}>
          v2 디자인시스템 · STEP 1 아토믹 컴포넌트
        </p>
      </header>

      <div style={grid}>
        <Section title="01. Buttons">
          <div style={stack}>
            <div style={row}>
              <Button variant="primary">진단 시작하기</Button>
              <Button variant="secondary">+ 책 추가하기</Button>
              <Button variant="text">나중에 할게요</Button>
            </div>
            <div style={row}>
              <Button variant="primary" disabled>비활성</Button>
              <Button variant="primary" block>블록 버튼</Button>
            </div>
            <div style={row}>
              <IconButton label="좋아요" active>{HeartIcon}</IconButton>
              <IconButton label="댓글">{CommentIcon}</IconButton>
            </div>
          </div>
        </Section>

        <Section title="02. Option (진단 선택지)">
          <div>
            {[
              ['A', '베스트셀러 / 화제성'],
              ['B', '작가 / 작품성'],
              ['C', '표지 / 제목'],
              ['D', '추천 / 리뷰'],
            ].map(([key, text]) => (
              <Option key={key} optionKey={key} selected={selected === key} onSelect={() => setSelected(key)}>
                {text}
              </Option>
            ))}
          </div>
        </Section>

        <Section title="02b. Progress">
          <div style={stack}>
            <Progress value={2} max={12} />
            <Progress value={9} max={12} />
            <Progress value={12} max={12} showLabel={false} />
          </div>
        </Section>

        <Section title="04. Rarity Badge">
          <div style={row}>
            <RarityBadge variant="common" label="흔함" sub="상위 50%" />
            <RarityBadge variant="rare" label="희귀" sub="상위 15%" />
            <RarityBadge variant="legendary" label="최희귀" sub="상위 5%" />
          </div>
        </Section>

        <Section title="04b. Rarity Tag (인라인 소형)">
          <div style={row}>
            <RarityTag variant="common">흔함 9.4%</RarityTag>
            <RarityTag variant="rare">희귀 4.1%</RarityTag>
            <RarityTag variant="legendary">최희귀 2.1%</RarityTag>
          </div>
        </Section>

        <Section title="05. Stat Bar">
          <div style={stack}>
            <StatBar name="몰입력" value={92} />
            <StatBar name="허세력" value={48} />
            <StatBar name="수집력" value={76} />
            <StatBar name="공감력" value={61} />
            <StatBar name="실천력" value={35} />
          </div>
        </Section>

        <Section title="08. Chip / Tag">
          <div style={row}>
            {chips.map(({ label, icon }) => (
              <Chip
                key={label}
                icon={icon}
                active={activeChip === label}
                onClick={() => setActiveChip(label)}
              >
                {label}
              </Chip>
            ))}
          </div>
        </Section>

        <Section title="09. Toggle / Check">
          <div style={row}>
            <Toggle on={toggleOn} label="알림 설정" onToggle={() => setToggleOn(!toggleOn)} />
            <Check checked={checked} label="동의" onToggle={() => setChecked(!checked)} />
            <Check checked={false} label="미체크 상태" />
          </div>
        </Section>

        <Section title="10. Input Field">
          <Input icon={SearchIcon} placeholder="책 제목, 저자, 키워드로 검색" />
        </Section>

        <Section title="10b. Textarea">
          <Textarea placeholder="이 책에 대한 생각을 자유롭게 적어주세요" />
        </Section>

        <Section title="Card (공통 컨테이너)">
          <div style={stack}>
            <Card>기본 카드 — 보더 없음 + 연한 베이지</Card>
            <Card spotlight>강조 카드 — 흰 배경 + 연한 그레이 보더</Card>
          </div>
        </Section>

        <Section title="Callout (안내 박스)">
          <div style={stack}>
            <Callout>몰입수집가 유형은 밤 독서와 궁합이 좋아요.</Callout>
            <Callout muted>진단을 완료하면 맞춤 추천이 열려요.</Callout>
          </div>
        </Section>

        <Section title="Row (리스트 행)">
          <div style={stack}>
            <Row>
              {BookIcon}
              <span style={{ flex: 1 }}>첫 완독 칭호</span>
              <span className="bj-caption">6월 12일</span>
            </Row>
            <Row>
              {MoonIcon}
              <span style={{ flex: 1 }}>밤샘 독서 배지</span>
              <span className="bj-caption">7월 2일</span>
            </Row>
          </div>
        </Section>

        <Section title="Segmented (다구간 누적 바)">
          <Segmented segments={[42, 28, 18, 12]} label="독서 뇌구조" />
        </Section>

        <Section title="Section Label">
          <SectionLabel>Today&apos;s Pick</SectionLabel>
        </Section>

        <Section title="Sheet (바텀시트)">
          <Button variant="secondary" onClick={() => setSheetOpen(true)}>시트 열기</Button>
          <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)}>
            <p className="bj-title" style={{ margin: '0 0 12px' }}>유형 선택</p>
            <Option optionKey="A" selected onSelect={() => setSheetOpen(false)}>심해 독서가</Option>
            <Option optionKey="B" onSelect={() => setSheetOpen(false)}>책벌레 학자</Option>
          </Sheet>
        </Section>

        <Section title="11. Typography">
          <Card>
            <div style={stack}>
              <span className="bj-heading">제목은 이렇게 표시됩니다.</span>
              <span className="bj-title">타이틀은 이렇게 표시됩니다.</span>
              <span>본문은 이렇게 표시됩니다.</span>
              <span className="bj-caption">보조 정보는 이렇게 표시됩니다.</span>
              <span className="bj-nickname">닉네임은 Wildgak</span>
            </div>
          </Card>
        </Section>
      </div>

      <Section title="13. Bottom Navigation">
        <BottomNav>
          {[
            ['홈', HomeIcon],
            ['탐색', SearchIcon],
            ['진단', StarIcon],
            ['소셜', UsersIcon],
            ['마이', UserIcon],
          ].map(([label, icon]) => (
            <NavItem
              key={label as string}
              label={label as string}
              icon={icon}
              active={activeNav === label}
              onClick={() => setActiveNav(label as string)}
            />
          ))}
        </BottomNav>
      </Section>
    </main>
  )
}
