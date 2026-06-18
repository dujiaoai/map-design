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
  mfa: {
    enforcementEnabled: false,
    totpEnrollmentAvailable: true,
    enrolledPlatformAdminCount: 0,
  },
  oidc: {
    enabled: false,
    authorizationCodeFlowAvailable: false,
    configuredProviderCount: 0,
  },
  audit: {
    webhookEnabled: false,
    webhookConfigured: false,
    webhookFormat: 'jsonl',
    deliveryMode: 'csv_only',
  },
  runtime: { activeProfiles: ['dev'], jwtPermEpoch: 1 },
}

describe('buildSystemHealthSignals', () => {
  it('marks mail as warn when enabled but not ready', () => {
    const signals = buildSystemHealthSignals(
      {
        ...BASE_FLAGS,
        mail: { enabled: true, fromAddress: '', outboundReady: false },
      },
      { status: 'ok', authenticated: true, platformAdmin: true },
    )
    const mail = signals.find((s) => s.id === 'mail')
    expect(mail?.level).toBe('warn')
  })

  it('marks billing integration as warn when disabled', () => {
    const signals = buildSystemHealthSignals(
      {
        ...BASE_FLAGS,
        billing: { ...BASE_FLAGS.billing, integrationEnabled: false },
      },
      { status: 'ok', authenticated: true, platformAdmin: true },
    )
    expect(signals.find((s) => s.id === 'billing')?.level).toBe('warn')
  })

  it('uses live billing probe when dependencies are provided', () => {
    const signals = buildSystemHealthSignals(
      BASE_FLAGS,
      { status: 'ok', authenticated: true, platformAdmin: true },
      false,
      {
        edges: [{ from: 'saas-api', to: 'billing-api', kind: 'HTTP /actuator/health' }],
        nodes: [
          { id: 'saas-api', label: 'SaaS API', status: 'UP', url: null, detail: 'online' },
          {
            id: 'billing-api',
            label: 'Billing API',
            status: 'UP',
            url: 'http://localhost:8083',
            detail: 'probe ok',
          },
        ],
      },
    )
    const billing = signals.find((s) => s.id === 'billing')
    expect(billing?.label).toBe('Billing API')
    expect(billing?.level).toBe('ok')
    expect(billing?.detail).toContain('探活 UP')
  })

  it('marks billing probe as warn when downstream is down', () => {
    const signals = buildSystemHealthSignals(
      BASE_FLAGS,
      { status: 'ok', authenticated: true, platformAdmin: true },
      false,
      {
        edges: [],
        nodes: [
          { id: 'saas-api', label: 'SaaS API', status: 'UP', url: null, detail: 'online' },
          {
            id: 'billing-api',
            label: 'Billing API',
            status: 'DOWN',
            url: 'http://localhost:8083',
            detail: 'Connection refused',
          },
        ],
      },
    )
    expect(signals.find((s) => s.id === 'billing')?.level).toBe('warn')
  })

  it('summarizes overall health with warnings', () => {
    const signals = buildSystemHealthSignals(
      {
        ...BASE_FLAGS,
        billing: { ...BASE_FLAGS.billing, integrationEnabled: false },
      },
      { status: 'ok', authenticated: true, platformAdmin: true },
    )
    const summary = summarizeSystemHealth(signals)
    expect(summary.overall).toBe('warn')
    expect(summary.warnings).toBe(1)
  })

  it('reports ok when all critical signals are healthy', () => {
    const signals = buildSystemHealthSignals(BASE_FLAGS, {
      status: 'ok',
      authenticated: true,
      platformAdmin: true,
    })
    const summary = summarizeSystemHealth(signals)
    expect(summary.overall).toBe('info')
    expect(summary.warnings).toBe(0)
  })

  it('marks admin api as warn when ping fails', () => {
    const signals = buildSystemHealthSignals(BASE_FLAGS, undefined, true)
    const api = signals.find((s) => s.id === 'admin-api')
    expect(api?.level).toBe('warn')
  })

  it('includes admin api signal first', () => {
    const signals = buildSystemHealthSignals(BASE_FLAGS, {
      status: 'ok',
      authenticated: true,
      platformAdmin: true,
    })
    expect(signals[0]?.id).toBe('admin-api')
  })

  it('marks admin mfa as warn when enforced but nobody enrolled', () => {
    const signals = buildSystemHealthSignals(
      {
        ...BASE_FLAGS,
        mfa: {
          enforcementEnabled: true,
          totpEnrollmentAvailable: true,
          enrolledPlatformAdminCount: 0,
        },
      },
      { status: 'ok', authenticated: true, platformAdmin: true },
    )
    expect(signals.find((s) => s.id === 'admin-mfa')?.level).toBe('warn')
  })
})
