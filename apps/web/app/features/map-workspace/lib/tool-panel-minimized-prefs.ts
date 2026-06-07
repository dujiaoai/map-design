const MINIMIZED_PREFIX = 'map-tool-panel-minimized:'

export function loadToolPanelMinimized(navItemId: string): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  return localStorage.getItem(`${MINIMIZED_PREFIX}${navItemId}`) === '1'
}

export function saveToolPanelMinimized(navItemId: string, minimized: boolean): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.setItem(`${MINIMIZED_PREFIX}${navItemId}`, minimized ? '1' : '0')
}

export function clearToolPanelMinimized(navItemId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  localStorage.removeItem(`${MINIMIZED_PREFIX}${navItemId}`)
}
