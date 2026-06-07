import { describe, expect, it } from 'vitest'

import { findNavSectionLabelByNavItemId } from './find-nav-section'

describe('findNavSectionLabelByNavItemId', () => {
  it('returns layers section for thematic module', () => {
    expect(findNavSectionLabelByNavItemId('module-thematic')).toBe('图层')
  })

  it('returns analysis section for spatial analysis module', () => {
    expect(findNavSectionLabelByNavItemId('module-spatial-analysis')).toBe('分析')
  })

  it('returns analysis section for property view module', () => {
    expect(findNavSectionLabelByNavItemId('module-property-view')).toBe('分析')
  })

  it('returns analysis section for favorites module', () => {
    expect(findNavSectionLabelByNavItemId('module-my-favorites')).toBe('分析')
  })

  it('returns layers section for scenic spots module', () => {
    expect(findNavSectionLabelByNavItemId('module-scenic-spots')).toBe('图层')
  })

  it('returns ops section for view project module', () => {
    expect(findNavSectionLabelByNavItemId('module-view-project')).toBe('运营')
  })

  it('returns uav section for dock module', () => {
    expect(findNavSectionLabelByNavItemId('dock-uav-list')).toBe('机库')
  })

  it('returns null for unknown nav item', () => {
    expect(findNavSectionLabelByNavItemId('tool-measure-distance')).toBeNull()
  })
})
