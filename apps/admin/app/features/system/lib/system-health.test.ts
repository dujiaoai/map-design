import { describe, expect, it } from 'vitest'

import type { AdminSystemFlagsResponse } from '~/shared/api/admin-api'

import {
  buildSystemHealthSignals,
  summarizeSystemHealth,
} from './system-health'

const BASE_FLAGS: AdminSystemFlagsResponse = {
  registration: {
    allowPublicOrgSignup: true,
    allowPublicPersonalSignup: false,
    registrationTokenTtl: '24h',
  },
  auth: { passwordStrengthEnabled: true },
  mail: { enabled: true, fromAddress: 'noreply@demo.local', outboundReady: true },
  rateLimit: { enabled: true, loginIpMaxAttempts: 20, loginAccountMaxAttempts: 10 },
  tenantRls: { enabled: true },
  billing: {
    integrationEnabled: true,
    baseUrl: 'http://localhost:8083',
    membershipPushEnabled: false,
  },
  runtime: { activeProfiles: ['dev'], jwtPermEpoch: 1 },
}

describe('buildSystemHealthSignals', () => {
  it('marks mail as warn when enabled but not ready', () => {
    const signals = buildSystemHealthSignals({
      ...BASE_FLAGS,
      mail: { enabled: true, fromAddress: '', outboundReady: false },
    })
    const mail = signals.find((s) => s.id === 'mail')
    expect(mail?.level).toBe('warn')
  })

  it('marks billing integration as warn when disabled', () => {
    const signals = buildSystemHealthSignals({
      ...BASE_FLAGS,
      billing: { ...BASE_FLAGS.billing, integrationEnabled: false },
    })
    expect(signals.find((s) => s.id === 'billing')?.level).toBe('warn')
  })

  it('summarizes overall health with warnings', () => {
    const signals = buildSystemHealthSignals({
      ...BASE_FLAGS,
      billing: { ...BASE_FLAGS.billing, integrationEnabled: false },
    })
    const summary = summarizeSystemHealth(signals)
    expect(summary.overall).toBe('warn')
    expect(summary.warnings).toBe(1)
  })

  it('reports ok when all critical signals are healthy', () => {
    const signals = buildSystemHealthSignals(BASE_FLAGS)
    const summary = summarizeSystemHealth(signals)
    expect(summary.overall).toBe('ok')
    expect(summary.warnings).toBe(0)
  })
})
