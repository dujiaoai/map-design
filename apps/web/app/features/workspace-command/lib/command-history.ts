import { workspaceActionKey, type WorkspaceAction } from './workspace-action'

const HISTORY_STORAGE_KEY = 'map-workspace-command-history'
const MAX_HISTORY = 8

export function loadCommandHistory(): string[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item): item is string => typeof item === 'string').slice(0, MAX_HISTORY)
  } catch {
    return []
  }
}

export function rememberCommandAction(action: WorkspaceAction): string[] {
  const key = workspaceActionKey(action)
  if (key.startsWith('search:') && action.type === 'mapSearch') {
    return loadCommandHistory()
  }

  const previous = loadCommandHistory().filter((item) => item !== key)
  const next = [key, ...previous].slice(0, MAX_HISTORY)

  if (typeof window !== 'undefined') {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(next))
  }

  return next
}

export function resetCommandHistory(): void {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(HISTORY_STORAGE_KEY)
}
