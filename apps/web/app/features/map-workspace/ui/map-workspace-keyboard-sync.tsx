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

function focusGlobalSearch() {
  const input = document.getElementById(SEARCH_INPUT_ID)
  if (!(input instanceof HTMLInputElement)) {
    return
  }

  input.focus()
  input.select()
}

function openGlobalSearchPopover() {
  useMapWorkspaceStore.getState().setGlobalSearchPopoverOpen(true)
}

function dismissActiveTools() {
  const state = useMapWorkspaceStore.getState()

  if (state.globalSearchPopoverOpen) {
    state.setGlobalSearchPopoverOpen(false)
    return true
  }

  if (state.activeMapTool || state.activeDrawerTool) {
    state.clearMapTool()
    return true
  }

  if (state.activePanelTools.length > 0) {
    useMapWorkspaceStore.setState({ activePanelTools: [] })
    return true
  }

  return false
}

/** 工作台全局快捷键：/ 聚焦搜索、Ctrl/Cmd+K 打开搜索、Esc 退出工具 */
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
        return
      }

      if (event.key === '/') {
        event.preventDefault()
        openGlobalSearchPopover()
        focusGlobalSearch()
        return
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openGlobalSearchPopover()
        focusGlobalSearch()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return null
}

export { SEARCH_INPUT_ID as WORKSPACE_GLOBAL_SEARCH_INPUT_ID }
