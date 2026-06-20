import { describe, expect, it } from 'vitest'

import {
  formatAuditActionLabel,
  formatAuditDetailContent,
  getAuditActionCategory,
  getAuditActionVerb,
} from './audit-log-labels'

describe('formatAuditActionLabel', () => {
  it('returns Chinese label for known actions', () => {
    expect(formatAuditActionLabel('tenant.update')).toBe('更新租户')
    expect(formatAuditActionLabel('billing.wallet.adjust')).toBe('计费调账')
  })

  it('falls back to raw action code', () => {
    expect(formatAuditActionLabel('custom.action')).toBe('custom.action')
  })
})

describe('getAuditActionCategory', () => {
  it('classifies action prefixes', () => {
    expect(getAuditActionCategory('member.invite.email')).toBe('member')
    expect(getAuditActionCategory('role.permissions.update')).toBe('rbac')
    expect(getAuditActionCategory('billing.coupon.write')).toBe('billing')
  })
})

describe('getAuditActionVerb', () => {
  it('detects create/update/delete verbs', () => {
    expect(getAuditActionVerb('tenant.create')).toBe('create')
    expect(getAuditActionVerb('tenant.update')).toBe('update')
    expect(getAuditActionVerb('tenant_role.delete')).toBe('delete')
  })
})

describe('formatAuditDetailContent', () => {
  it('pretty-prints JSON detail', () => {
    const result = formatAuditDetailContent('{"name":"Demo"}')
    expect(result.isJson).toBe(true)
    expect(result.text).toContain('"name"')
  })

  it('returns placeholder for empty detail', () => {
    expect(formatAuditDetailContent(null).empty).toBe(true)
  })
})
