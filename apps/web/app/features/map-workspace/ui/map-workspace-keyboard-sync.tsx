import { useEffect } from 'react'

import { useMapWorkspaceStore } from '../model/workspace-store'

const SEARCH_INPUT_ID = 'workspace-global-search'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tag = target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    return true
  }

  return target.isContentEditable
}

function dismissActiveTools() {
  const state = useMapWorkspaceStore.getState()

  if (state.commandPaletteOpen) {
    state.closeCommandPalette()
    return true
  }

  if (state.globalSearchPopoverOpen) {
    state.setGlobalSearchPopoverOpen(false)
    return true
  }

  if (state.activeMapTool || state.activeDrawerTool) {
    state.clearMapTool()
    return true
  }

  if (state.activePanelTools.length > 0) {
    state.clearPanelTools()
    return true
  }

  return false
}

/** 工作台全局快捷键：/ 与 Ctrl/Cmd+K 打开命令面板、Esc 逐级退出 */
export function MapWorkspaceKeyboardSync() {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (dismissActiveTools()) {
          event.preventDefault()
        }
        return
      }

      if (isEditableTarget(event.target)) {
        const target = event.target
        if (
          target instanceof HTMLInputElement &&
          target.id === SEARCH_INPUT_ID &&
          (event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === 'k'
        ) {
          event.preventDefault()
          useMapWorkspaceStore.getState().openCommandPalette(target.value)
        }
        return
      }

      if (event.key === '/') {
        event.preventDefault()
        useMapWorkspaceStore.getState().openCommandPalette()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        useMapWorkspaceStore.getState().openCommandPalette()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}

export { SEARCH_INPUT_ID as WORKSPACE_GLOBAL_SEARCH_INPUT_ID }
