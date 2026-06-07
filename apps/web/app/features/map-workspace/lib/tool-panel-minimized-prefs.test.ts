import { describe, expect, it, beforeEach, vi } from 'vitest'

import {
  clearToolPanelMinimized,
  loadToolPanelMinimized,
  saveToolPanelMinimized,
} from './tool-panel-minimized-prefs'

describe('tool panel minimized prefs', () => {
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

  it('defaults to expanded', () => {
    expect(loadToolPanelMinimized('tool-measure-distance')).toBe(false)
  })

  it('persists minimized state per tool', () => {
    saveToolPanelMinimized('tool-measure-distance', true)
    expect(loadToolPanelMinimized('tool-measure-distance')).toBe(true)
    expect(loadToolPanelMinimized('tool-measure-area')).toBe(false)
  })

  it('clears minimized state', () => {
    saveToolPanelMinimized('tool-measure-distance', true)
    clearToolPanelMinimized('tool-measure-distance')
    expect(loadToolPanelMinimized('tool-measure-distance')).toBe(false)
  })
})
