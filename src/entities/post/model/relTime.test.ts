import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatRelTime } from './relTime'

describe('formatRelTime', () => {
  const now = new Date(2026, 9, 7, 12, 0).getTime()
  beforeEach(() => vi.useFakeTimers({ now }))
  afterEach(() => vi.useRealTimers())

  it('방금 / 분 / 시간 / 일, 7일부터는 날짜', () => {
    expect(formatRelTime(now - 30_000)).toBe('방금')
    expect(formatRelTime(now - 5 * 60_000)).toBe('5분 전')
    expect(formatRelTime(now - 3 * 3600_000)).toBe('3시간 전')
    expect(formatRelTime(now - 6 * 86400_000)).toBe('6일 전')
    expect(formatRelTime(now - 7 * 86400_000)).toBe('2026.9.30')
  })
})
