import { describe, expect, it, beforeEach, vi } from 'vitest'

import {
  canReorderQuickTools,
  DEFAULT_QUICK_TOOL_IDS,
  groupSelectedQuickTools,
  orderQuickToolbarIds,
  sanitizeQuickToolbarIds,
} from './quick-toolbar-catalog'
import { loadQuickToolbarIds, resetQuickToolbarIds, saveQuickToolbarIds } from './quick-toolbar-prefs'

describe('quick-toolbar prefs', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      store: {} as Record<string, string>,
      getItem(key: string) {
        return this.store[key] ?? null
      },
      setItem(key: string, value: string) {
        this.store[key] = value
      },
      removeItem(key: string) {
        delete this.store[key]
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
      'tool-panorama-point',
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
      'tool-import-file',
      'tool-swipe-compare',
    ])

    expect(groupSelectedQuickTools(shuffled)).toEqual([
      {
        group: 'measure',
        label: '测量',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-measure-distance' }),
        ]),
      },
      {
        group: 'draw',
        label: '绘制',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-pick-point' }),
        ]),
      },
      {
        group: 'data',
        label: '数据',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-import-file' }),
        ]),
      },
      {
        group: 'analysis',
        label: '分析',
        items: expect.arrayContaining([
          expect.objectContaining({ navItemId: 'tool-swipe-compare' }),
        ]),
      },
    ])
  })

  it('only allows reorder within the same category', () => {
    expect(canReorderQuickTools('tool-measure-distance', 'tool-measure-area')).toBe(true)
    expect(canReorderQuickTools('tool-measure-distance', 'tool-pick-point')).toBe(false)
  })
})
