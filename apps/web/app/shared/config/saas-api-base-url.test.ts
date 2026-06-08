import { describe, expect, it } from 'vitest'

import { resolveSaasApiBaseUrl } from './saas-api-base-url'

describe('resolveSaasApiBaseUrl', () => {
  it('defaults to /v1 for vite dev proxy', () => {
    expect(resolveSaasApiBaseUrl()).toBe('/v1')
    expect(resolveSaasApiBaseUrl(undefined)).toBe('/v1')
  })

  it('appends /v1 to absolute host', () => {
    expect(resolveSaasApiBaseUrl('http://localhost:8082')).toBe('http://localhost:8082/v1')
  })

  it('keeps path that already ends with /v1', () => {
    expect(resolveSaasApiBaseUrl('/v1')).toBe('/v1')
    expect(resolveSaasApiBaseUrl('http://localhost:8082/v1')).toBe('http://localhost:8082/v1')
  })
})
