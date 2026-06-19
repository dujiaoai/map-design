import { describe, expect, it } from 'vitest'

import {
  addDaysToDateString,
  resolveCreateTrialEndsAt,
} from './tenant-create-options'

describe('tenant-create-options', () => {
  it('addDaysToDateString offsets from anchor date', () => {
    const anchor = new Date('2026-06-19T12:00:00')
    expect(addDaysToDateString(14, anchor)).toBe('2026-07-03')
  })

  it('resolveCreateTrialEndsAt maps presets to epoch', () => {
    const anchor = new Date('2026-06-19T12:00:00')
    expect(resolveCreateTrialEndsAt('none', '')).toBeUndefined()

    const trial14 = resolveCreateTrialEndsAt('14d', '')
    expect(trial14).toBeTypeOf('number')
    expect(trial14).toBeGreaterThan(anchor.getTime())

    const custom = resolveCreateTrialEndsAt('custom', '2026-12-31')
    expect(custom).toBeTypeOf('number')
  })
})
