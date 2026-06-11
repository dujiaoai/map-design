import {
  DEFAULT_QUICK_TOOL_IDS,
  sanitizeQuickToolbarIds,
} from './quick-toolbar-catalog'
import { EDGE_MARGIN } from '../../workspace-surface-drag/lib/surface-drag-math'

const ONBOARDING_STORAGE_KEY = 'map-quick-toolbar-onboarding-seen'

export function hasSeenQuickToolbarOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === '1'
}

export function markQuickToolbarOnboardingSeen(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ONBOARDING_STORAGE_KEY, '1')
}

const POSITION_STORAGE_KEY = 'map-quick-toolbar-position'

export interface QuickToolbarPosition {
  x: number
  y: number
}

export const DEFAULT_QUICK_TOOLBAR_POSITION: QuickToolbarPosition = {
  x: EDGE_MARGIN,
  y: EDGE_MARGIN,
}

export function loadQuickToolbarPosition(): QuickToolbarPosition | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = localStorage.getItem(POSITION_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof (parsed as QuickToolbarPosition).x === 'number' &&
      typeof (parsed as QuickToolbarPosition).y === 'number'
    ) {
      return parsed as QuickToolbarPosition
    }
  } catch {
    return null
  }

  return null
}

export function saveQuickToolbarPosition(position: QuickToolbarPosition): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position))
}

export function resetQuickToolbarPosition(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(POSITION_STORAGE_KEY)
}

const COLLAPSED_STORAGE_KEY = 'map-quick-toolbar-collapsed'

export function loadQuickToolbarCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'
}

export function saveQuickToolbarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
}

const LAYOUT_STORAGE_KEY = 'map-quick-toolbar-layout'

export type QuickToolbarLayout = 'horizontal' | 'vertical'

export function loadQuickToolbarLayout(): QuickToolbarLayout {
  if (typeof window === 'undefined') return 'horizontal'
  const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
  return raw === 'vertical' ? 'vertical' : 'horizontal'
}

export function saveQuickToolbarLayout(layout: QuickToolbarLayout): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAYOUT_STORAGE_KEY, layout)
}

const STORAGE_KEY = 'map-workspace-quick-toolbar'

export function loadQuickToolbarIds(): string[] {
  if (typeof window === 'undefined') {
    return [...DEFAULT_QUICK_TOOL_IDS]
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return [...DEFAULT_QUICK_TOOL_IDS]
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_QUICK_TOOL_IDS]
    }

    return sanitizeQuickToolbarIds(parsed.filter((item): item is string => typeof item === 'string'))
  } catch {
    return [...DEFAULT_QUICK_TOOL_IDS]
  }
}

export function saveQuickToolbarIds(ids: string[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeQuickToolbarIds(ids)))
}

export function resetQuickToolbarIds(): string[] {
  const defaults = [...DEFAULT_QUICK_TOOL_IDS]
  saveQuickToolbarIds(defaults)
  return defaults
}
