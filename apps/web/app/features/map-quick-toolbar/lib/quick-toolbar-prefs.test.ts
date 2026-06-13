import { describe, expect, it, beforeEach, vi } from 'vitest'

import {
  canReorderQuickTools,
  DEFAULT_QUICK_TOOL_IDS,
  groupSelectedQuickTools,
  orderQuickToolbarIds,
  sanitizeQuickToolbarIds,
} from './quick-toolbar-catalog'
import { loadQuickToolbarCollapsed, loadQuickToolbarIds, loadQuickToolbarLayout, resetQuickToolbarIds, saveQuickToolbarCollapsed, saveQuickToolbarIds, saveQuickToolbarLayout } from './quick-toolbar-prefs'

describe('quick-toolbar prefs', () => {
  beforeEach(() => {
    const store: Record<string, string> = {}
    vi.stubGlobal('localStorage', {
      getItem(key: string) {
        return store[key] ?? null
      },
      setItem(key: string, value: string) {
        store[key] = value
      },
      removeItem(key: string) {
        delete store[key]
      },
    })
  })

  it('falls back to defaults when storage is empty', () => {
    expect(loadQuickToolbarIds()).toEqual([...DEFAULT_QUICK_TOOL_IDS])
  })

  it('persists sanitized selections', () => {
    saveQuickToolbarIds(['tool-measure-distance', 'invalid-id', 'tool-import-file'])
    expect(loadQuickToolbarIds()).toEqual(['tool-measure-distance', 'tool-import-file'])
  })

  it('reset restores defaults', () => {
    saveQuickToolbarIds(['tool-plot-point'])
    expect(resetQuickToolbarIds()).toEqual([...DEFAULT_QUICK_TOOL_IDS])
    expect(loadQuickToolbarIds()).toEqual([...DEFAULT_QUICK_TOOL_IDS])
  })

  it('sanitize keeps order and all valid catalog ids', () => {
    const ids = [
      'tool-measure-distance',
      'tool-measure-area',
      'tool-plot-point',
      'tool-draw-line',
      'tool-draw-surface',
      'tool-pick-point',
      'tool-locate-point',
      'tool-import-file',
      'tool-admin-divisions',
      'tool-swipe-compare',
      'tool-hd-image-compare',
    ]
    expect(sanitizeQuickToolbarIds(ids)).toEqual(orderQuickToolbarIds(ids))
  })

  it('orders selected tools by category for toolbar display', () => {
    const shuffled = [
      'tool-swipe-compare',
      'tool-import-file',
      'tool-measure-distance',
      'tool-pick-point',
    ]

    expect(orderQuickToolbarIds(shuffled)).toEqual([
      'tool-measure-distance',
      'tool-pick-point',
      'tool-swipe-compare',
      'tool-import-file',
    ])

    expect(groupSelectedQuickTools(shuffled)).toEqual([
      {
        group: 'measure',
        label: '量测',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-measure-distance' }),
        ]),
      },
      {
        group: 'draw',
        label: '标绘',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-pick-point' }),
        ]),
      },
      {
        group: 'compare',
        label: '对比',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-swipe-compare' }),
        ]),
      },
      {
        group: 'utility',
        label: '工具',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-import-file' }),
        ]),
      },
    ])
  })

  it('only allows reorder within the same category', () => {
    expect(canReorderQuickTools('tool-measure-distance', 'tool-measure-area')).toBe(true)
    expect(canReorderQuickTools('tool-measure-distance', 'tool-pick-point')).toBe(false)
  })

  it('persists collapsed state', () => {
    expect(loadQuickToolbarCollapsed()).toBe(false)
    saveQuickToolbarCollapsed(true)
    expect(loadQuickToolbarCollapsed()).toBe(true)
  })

  it('persists layout orientation', () => {
    expect(loadQuickToolbarLayout()).toBe('horizontal')
    saveQuickToolbarLayout('vertical')
    expect(loadQuickToolbarLayout()).toBe('vertical')
    saveQuickToolbarLayout('horizontal')
    expect(loadQuickToolbarLayout()).toBe('horizontal')
  })
})
