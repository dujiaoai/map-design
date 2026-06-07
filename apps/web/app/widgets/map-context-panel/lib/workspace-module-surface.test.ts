import { describe, expect, it } from 'vitest'

import { resolveModuleSurfaceDirection } from './workspace-module-surface'

describe('workspace-module-surface', () => {
  it('derives motion direction from section order', () => {
    expect(resolveModuleSurfaceDirection('uav:uav-list', 'ops:view-project')).toBe('forward')
    expect(resolveModuleSurfaceDirection('ops:view-project', 'data:thematic')).toBe('back')
  })
})
