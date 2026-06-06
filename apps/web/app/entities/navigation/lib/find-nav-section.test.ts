import { describe, expect, it } from 'vitest'

import { findNavSectionLabelByNavItemId } from './find-nav-section'

describe('findNavSectionLabelByNavItemId', () => {
  it('returns data section for thematic module', () => {
    expect(findNavSectionLabelByNavItemId('module-thematic')).toBe('数据')
  })

  it('returns uav section for dock module', () => {
    expect(findNavSectionLabelByNavItemId('dock-uav-list')).toBe('机库')
  })

  it('returns null for unknown nav item', () => {
    expect(findNavSectionLabelByNavItemId('tool-measure-distance')).toBeNull()
  })
})
