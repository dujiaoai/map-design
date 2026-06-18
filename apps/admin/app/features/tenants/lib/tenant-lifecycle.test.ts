import { describe, expect, it } from 'vitest'

import {
  resolveTenantTrialPhase,
  tenantTrialLabel,
  trialDateToEpochMs,
  trialEpochMsToDate,
} from './tenant-lifecycle'

describe('tenant-lifecycle', () => {
  it('detects active and expired trial', () => {
    expect(resolveTenantTrialPhase(null)).toBe('none')
    expect(resolveTenantTrialPhase(Date.now() + 86_400_000)).toBe('active')
    expect(resolveTenantTrialPhase(Date.now() - 86_400_000)).toBe('expired')
  })

  it('maps trial labels', () => {
    expect(tenantTrialLabel(null)).toBeNull()
    expect(tenantTrialLabel(Date.now() + 86_400_000)).toBe('试用中')
    expect(tenantTrialLabel(Date.now() - 86_400_000)).toBe('试用已到期')
  })

  it('converts date strings to end-of-day epoch', () => {
    const epoch = trialDateToEpochMs('2026-06-30')
    expect(epoch).not.toBeNull()
    expect(trialEpochMsToDate(epoch!)).toBe('2026-06-30')
  })
})
