import { describe, expect, it } from 'vitest'

import {
  AUDIT_EXPORT_PERMISSIONS,
  AUDIT_READ_PERMISSIONS,
} from './audit-log-permissions'

describe('audit-log-permissions', () => {
  it('requires dedicated audit read permission', () => {
    expect(AUDIT_READ_PERMISSIONS).toEqual(['admin:audit:read'])
  })

  it('requires dedicated audit export permission', () => {
    expect(AUDIT_EXPORT_PERMISSIONS).toEqual(['admin:audit:export'])
  })
})
