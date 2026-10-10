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
import Icon, { ICON_NAMES } from '@/shared/ui/Icon'
import TypeBadge from '@/shared/ui/TypeBadge'

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

const HeartIcon = <Icon name="heart" size={22} />
const BookIcon = <Icon name="book" size={16} />
const MoonIcon = <Icon name="moon" size={16} />
const BookmarkIcon = <Icon name="bookmark" size={16} />
const UsersIcon = <Icon name="users" size={22} />
const CommentIcon = <Icon name="comment" size={22} />
const SearchIcon = <Icon name="search" size={18} />
const HomeIcon = <Icon name="home" size={22} />
const StarIcon = <Icon name="star" size={22} />
const UserIcon = <Icon name="user" size={22} />

/* 하단탭 5종 — Figma TabIcon(이름 × 색) 대응 */
const TAB_ICONS = [
  ['홈', 'home'],
  ['발견', 'compass'],
  ['평가', 'star'],
  ['모임', 'users'],
  ['마이', 'user'],
] as const

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
    <main className="bj-shell bj-frame" style={{ paddingTop: 32, paddingBottom: 64 }}>
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
            <Card spotlight>강조 카드 — 주황050 면 (무테)</Card>
          </div>
        </Section>

        <Section title="Callout (안내 박스)">
          <Card>
            <div style={stack}>
              <Callout>몰입수집가 유형은 밤 독서와 궁합이 좋아요.</Callout>
              <Callout muted>진단을 완료하면 맞춤 추천이 열려요. (muted는 크림 고정 — 화이트 면 위에서 눌린 면으로 읽힌다)</Callout>
            </div>
          </Card>
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

      <Section title="14. Icon — 24×24 · stroke 2 · currentColor 상속 (34종)">
        <Card>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))',
              gap: 16,
            }}
          >
            {ICON_NAMES.map((name) => (
              <div key={name} style={{ ...stack, alignItems: 'center', gap: 6 }}>
                <Icon name={name} />
                <span className="bj-caption" style={{ fontSize: 10, textAlign: 'center' }}>
                  {name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="15. TabIcon — 하단탭 전용 5종 × 기본/활성">
        <Card>
          <div style={row}>
            {TAB_ICONS.map(([label, name]) => (
              <div key={label} style={{ ...stack, alignItems: 'center', gap: 6 }}>
                <div style={row}>
                  <span style={{ color: 'var(--color-text-caption)' }}><Icon name={name} size={22} /></span>
                  <span style={{ color: 'var(--color-accent)' }}><Icon name={name} size={22} /></span>
                </div>
                <span className="bj-caption" style={{ fontSize: 10 }}>{label}</span>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      <Section title="16. TypeBadge — 유형 배지">
        <Card>
          <div style={row}>
            <TypeBadge code="ENFP" />
            <TypeBadge code="ISTJ" />
          </div>
        </Card>
      </Section>

      <Section title="17. 화면 공통 요소 — Topbar / ProgressHeader / SubpageHead / SectionHead">
        <div style={stack}>
          <div className="bj-topbar">
            <Logo />
            <div style={{ ...row, gap: 4 }}>
              <IconButton label="검색"><Icon name="search" size={22} /></IconButton>
              <IconButton label="알림"><Icon name="bell" size={22} /></IconButton>
            </div>
          </div>

          <div className="bj-progress-head">
            <div className="bj-row-between bj-mb-8">
              <span className="bj-caption">질문 6 / 12</span>
              <span className="bj-caption bj-progress-pct bj-bold">50%</span>
            </div>
            <Progress value={6} max={12} />
          </div>

          <div className="bj-subpage-head">
            <IconButton label="뒤로"><Icon name="chevron-left" size={22} /></IconButton>
            <span className="bj-heading">서브페이지 제목</span>
          </div>

          <Card>
            <div className="bj-card-section-head">
              <span className="bj-section-label" style={{ marginBottom: 0 }}>카드 섹션 라벨</span>
            </div>
            <div className="bj-row-between">
              <span className="bj-title">섹션 헤드 SectionHead</span>
              <span className="bj-caption bj-caption--action">더보기</span>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="18. FAB 글쓰기 — 56px 원형 · 주황500 채움 (무테)">
        <Card>
          <button type="button" className="bj-fab" style={{ position: 'static' }} aria-label="글쓰기">
            <Icon name="edit" size={22} />
          </button>
        </Card>
      </Section>

      <Section title="19. Domain — PostCard / EventCard / ClubCard / ActivityRow / ReportStat">
        <div style={grid}>
          <article className="bj-post-card">
            <div className="bj-post-card__header">
              <TypeBadge code="ENFP" />
              <span className="bj-post-card__author bj-bold">밤샘독서가</span>
              <span className="bj-post-card__time bj-caption">2시간 전</span>
            </div>
            <div className="bj-post-card__body">
              <p className="bj-post-card__content bj-body">
                오늘 읽은 문장이 계속 맴돈다. 이런 밤이 좋다.
              </p>
              <span className="bj-post-book bj-post-book--aside">
                <span className="bj-post-book__cover" />
                <span className="bj-post-book__title">아무튼, 계속</span>
              </span>
            </div>
            <div className="bj-post-card__footer">
              <button type="button" className="bj-post-card__like-btn bj-post-card__like-btn--active">
                <Icon name="heart-fill" size={16} />
                <span>12</span>
              </button>
              <span className="bj-post-card__comment-count bj-caption">
                <Icon name="comment" size={16} />3
              </span>
            </div>
          </article>

          <div className="bj-event-card bj-event-card--official">
            <div className="bj-event-card__head">
              <span className="bj-chip bj-chip--active bj-event-card__badge">공식</span>
              <span className="bj-chip bj-chip--online bj-event-card__loc">온라인</span>
            </div>
            <p className="bj-h2 bj-event-card__title">함께 읽는 밤</p>
            <p className="bj-body bj-event-card__desc">각자 읽고 30분 나눕니다.</p>
            <div className="bj-event-card__meta">
              <span className="bj-caption">3월 14일 20:00</span>
              <span className="bj-caption">12/20명 참여</span>
            </div>
            <button type="button" className="bj-btn bj-btn--primary bj-event-card__join-btn">참가하기</button>
          </div>

          <div className="bj-event-card">
            <div className="bj-event-card__head">
              <span className="bj-chip">격주 오프라인</span>
            </div>
            <p className="bj-body bj-bold bj-event-card__title">에세이 모임 · 잔잔</p>
            <p className="bj-caption bj-event-card__desc">한 달에 두 권, 천천히 읽습니다.</p>
            <p className="bj-caption">밤샘독서가 주최 · 8/12명</p>
          </div>

          <Card>
            <div className="bj-row bj-row--compact">
              <p className="bj-activity-label">내가 쓴 글</p>
              <span className="bj-caption bj-bold">24</span>
              <span className="bj-icon-hint"><Icon name="chevron-right" size={16} /></span>
            </div>
            <div className="bj-report-stats">
              <div className="bj-report-stat">
                <span className="bj-display bj-display--lg">128</span>
                <span className="bj-caption">읽은 책</span>
              </div>
              <div className="bj-report-stat">
                <span className="bj-display bj-display--lg">4.2</span>
                <span className="bj-caption">평균 별점</span>
              </div>
            </div>
          </Card>
        </div>
      </Section>

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
