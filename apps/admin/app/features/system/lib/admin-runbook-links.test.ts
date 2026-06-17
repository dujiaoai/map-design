import { describe, expect, it } from 'vitest'

import { ADMIN_RUNBOOK_LINKS, resolveRunbookDocsHref } from './admin-runbook-links'

describe('resolveRunbookDocsHref', () => {
  it('returns null when browse base is unset', () => {
    expect(resolveRunbookDocsHref('docs/runbooks/local-dev.md')).toBeNull()
  })
})

describe('ADMIN_RUNBOOK_LINKS', () => {
  it('includes billing reconciliation with in-app tab link', () => {
    const item = ADMIN_RUNBOOK_LINKS.find((link) => link.id === 'billing-reconciliation')
    expect(item?.inAppTo).toBe('/billing?tab=reconciliation')
  })

  it('uses unique ids', () => {
    const ids = ADMIN_RUNBOOK_LINKS.map((link) => link.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
