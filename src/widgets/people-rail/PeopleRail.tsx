'use client'

// 홈 사람 가로 슬라이드 — 기준 하나를 랜덤으로 골라 보여준다.
// 3명 미만인 기준은 건너뛰고, 모두 비면 섹션 자체를 숨긴다.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { TypeCode } from '@/entities/reading-type/model/readingTypes'
import { loadActivePeople, loadSameTypePeople, type RailPerson } from '@/entities/person/api/peopleRailRemote'
import { getMatchedPeople } from '@/features/people-match/model/peopleMatch'
import IllustPlaceholder from '@/shared/ui/IllustPlaceholder'
import TypeBadge from '@/shared/ui/TypeBadge'

const LIMIT = 8

type RailItem = RailPerson & { affinity?: number }
interface Criterion {
  title: string
  load: () => Promise<RailItem[]>
}

function criteriaFor(typeCode: TypeCode | null): Criterion[] {
  const list: Criterion[] = [{ title: '요즘 활발한 사람', load: () => loadActivePeople(LIMIT) }]
  if (typeCode) {
    list.push(
      {
        title: '나와 취향이 비슷한 사람',
        load: async () =>
          (await getMatchedPeople()).slice(0, LIMIT).map(({ person, affinity }) => ({
            id: person.id,
            nickname: person.nickname,
            typeCode: person.typeCode,
            affinity,
          })),
      },
      { title: '나와 BOOKBTI가 같은 사람', load: () => loadSameTypePeople(typeCode, LIMIT) },
    )
  }
  return list.sort(() => Math.random() - 0.5)
}

export default function PeopleRail({ typeCode }: { typeCode: TypeCode | null }) {
  const [rail, setRail] = useState<{ title: string; people: RailItem[] } | null>(null)

  useEffect(() => {
    let alive = true
    async function pick() {
      for (const c of criteriaFor(typeCode)) {
        const people = await c.load().catch((): RailItem[] => [])
        if (!alive) return
        if (people.length >= 3) { setRail({ title: c.title, people }); return }
      }
      setRail(null)
    }
    void pick()
    return () => { alive = false }
  }, [typeCode])

  if (!rail) return null

  return (
    <section className="bj-section">
      <div className="bj-section__head">
        <p className="bj-h2">{rail.title}</p>
      </div>
      <ul className="bj-rail bj-people-rail">
        {rail.people.map((p) => (
          <li key={p.id}>
            <Link href={`/people/${p.id}`} className="bj-people-rail__card">
              <div className="bj-people-rail__avatar">
                {p.typeCode && (
                  <IllustPlaceholder code={p.typeCode} alt="" aspectRatio="1 / 1" fit="contain" background="transparent" />
                )}
              </div>
              <span className="bj-body bj-bold bj-people-rail__name">{p.nickname}</span>
              <TypeBadge code={p.typeCode} />
              {p.affinity !== undefined && <span className="bj-caption bj-text-action">궁합 {p.affinity}%</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
