import { describe, expect, it } from 'vitest'

import {
  menuOverrideEnabledLabel,
  resolveMenuOverrideEnabled,
} from './menu-override-options'

describe('menu-override-options', () => {
  it('resolveMenuOverrideEnabled maps nullish to inherit', () => {
    expect(resolveMenuOverrideEnabled(null)).toBe('inherit')
    expect(resolveMenuOverrideEnabled(undefined)).toBe('inherit')
    expect(resolveMenuOverrideEnabled(true)).toBe('true')
    expect(resolveMenuOverrideEnabled(false)).toBe('false')
  })

  it('menuOverrideEnabledLabel returns Chinese labels', () => {
    expect(menuOverrideEnabledLabel(null)).toBe('继承')
    expect(menuOverrideEnabledLabel(true)).toBe('强制启用')
    expect(menuOverrideEnabledLabel(false)).toBe('强制禁用')
  })
})
