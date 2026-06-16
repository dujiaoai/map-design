import { describe, expect, it } from 'vitest'

import { dateInputToFromEpoch, dateInputToToEpoch } from './audit-log-date-range'

describe('audit-log-date-range', () => {
  it('converts date inputs to local day boundaries', () => {
    const from = dateInputToFromEpoch('2026-06-15')
    const to = dateInputToToEpoch('2026-06-15')
    expect(from).toBeTypeOf('number')
    expect(to).toBeTypeOf('number')
    expect(to).toBeGreaterThan(from!)
  })

  it('returns undefined for empty input', () => {
    expect(dateInputToFromEpoch('')).toBeUndefined()
    expect(dateInputToToEpoch('  ')).toBeUndefined()
  })
})
