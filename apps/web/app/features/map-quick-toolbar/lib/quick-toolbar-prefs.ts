import {
  DEFAULT_QUICK_TOOL_IDS,
  sanitizeQuickToolbarIds,
} from './quick-toolbar-catalog'

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
