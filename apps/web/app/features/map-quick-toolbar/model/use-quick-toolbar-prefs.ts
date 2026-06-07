import { useCallback, useEffect, useState } from 'react'

import {
  canReorderQuickTools,
  MIN_QUICK_TOOLS,
  orderQuickToolbarIds,
  QUICK_TOOL_CATALOG,
  sanitizeQuickToolbarIds,
} from '../lib/quick-toolbar-catalog'
import {
  loadQuickToolbarCollapsed,
  loadQuickToolbarIds,
  resetQuickToolbarIds,
  saveQuickToolbarCollapsed,
  saveQuickToolbarIds,
} from '../lib/quick-toolbar-prefs'

export function useQuickToolbarPrefs() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => loadQuickToolbarIds())
  const [collapsed, setCollapsed] = useState(() => loadQuickToolbarCollapsed())

  useEffect(() => {
    saveQuickToolbarIds(selectedIds)
  }, [selectedIds])

  useEffect(() => {
    saveQuickToolbarCollapsed(collapsed)
  }, [collapsed])

  const toggleTool = useCallback((navItemId: string, enabled: boolean) => {
    setSelectedIds((prev) => {
      if (enabled) {
        if (prev.includes(navItemId)) return prev
        return sanitizeQuickToolbarIds([...prev, navItemId])
      }
      if (prev.length <= MIN_QUICK_TOOLS) return prev
      return sanitizeQuickToolbarIds(prev.filter((id) => id !== navItemId))
    })
  }, [])

  const moveTool = useCallback((navItemId: string, direction: 'up' | 'down') => {
    setSelectedIds((prev) => {
      const index = prev.indexOf(navItemId)
      if (index === -1) return prev

      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= prev.length) return prev

      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(targetIndex, 0, item)
      return next
    })
  }, [])

  const reorderTools = useCallback((activeId: string, overId: string) => {
    if (!canReorderQuickTools(activeId, overId)) {
      return
    }

    setSelectedIds((prev) => {
      const ordered = orderQuickToolbarIds(prev)
      const oldIndex = ordered.indexOf(activeId)
      const newIndex = ordered.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev

      const next = [...ordered]
      const [item] = next.splice(oldIndex, 1)
      next.splice(newIndex, 0, item)
      return next
    })
  }, [])

  const restoreDefaults = useCallback(() => {
    setSelectedIds(resetQuickToolbarIds())
  }, [])

  return {
    selectedIds,
    collapsed,
    setCollapsed,
    catalog: QUICK_TOOL_CATALOG,
    toggleTool,
    moveTool,
    reorderTools,
    restoreDefaults,
    minTools: MIN_QUICK_TOOLS,
  }
}
