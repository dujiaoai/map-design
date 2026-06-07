import { describe, expect, it } from 'vitest'

import { usesLeftContextPanel } from './uses-left-context-panel'

describe('usesLeftContextPanel', () => {
  it('uses left panel for parallel-panel and modify-panel modules', () => {
    expect(usesLeftContextPanel('thematic')).toBe(true)
    expect(usesLeftContextPanel('spatial-analysis')).toBe(true)
    expect(usesLeftContextPanel('view-project')).toBe(true)
  })

  it('uses native carrier for display modules', () => {
    expect(usesLeftContextPanel('legend')).toBe(false)
    expect(usesLeftContextPanel('scenic-spots')).toBe(false)
    expect(usesLeftContextPanel('flight-ledger')).toBe(false)
  })
})
