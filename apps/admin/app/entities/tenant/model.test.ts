import { describe, expect, it } from 'vitest'

import type { AdminTenantOidcConfig } from '~/entities/tenant/model'

describe('AdminTenantOidcConfig', () => {
  it('includes Phase 9 metadata fields', () => {
    const config: AdminTenantOidcConfig = {
      tenantId: 't-1',
      enabled: true,
      displayName: 'Corp SSO',
      issuerUri: 'https://idp.example.com',
      clientId: 'client',
      configured: true,
      clientSecretConfigured: true,
      scopes: 'openid profile email',
      expectedCallbackUrl: 'http://localhost:5175/auth/tenant-sso/callback/acme',
      metadataImported: true,
      metadataImportedAt: 1_700_000_000_000,
    }
    expect(config.metadataImported).toBe(true)
    expect(config.expectedCallbackUrl).toContain('/auth/tenant-sso/callback/')
  })
})
