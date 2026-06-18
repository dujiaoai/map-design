import { describe, expect, it } from 'vitest'

import type { AdminAuditWebhookConfig } from '~/entities/audit-log/model'

describe('AdminAuditWebhookConfig', () => {
  it('accepts signatureEnabled flag', () => {
    const config: AdminAuditWebhookConfig = {
      enabled: true,
      configured: true,
      format: 'jsonl',
      deliveryMode: 'webhook',
      signatureEnabled: true,
    }
    expect(config.signatureEnabled).toBe(true)
  })
})
