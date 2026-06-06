import { useCallback, useEffect, useState } from 'react'

import {
  MIN_QUICK_TOOLS,
  QUICK_TOOL_CATALOG,
  sanitizeQuickToolbarIds,
} from '../lib/quick-toolbar-catalog'
import {
  loadQuickToolbarIds,
  resetQuickToolbarIds,
  saveQuickToolbarIds,
} from '../lib/quick-toolbar-prefs'

export function useQuickToolbarPrefs() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => loadQuickToolbarIds())

  useEffect(() => {
    saveQuickToolbarIds(selectedIds)
  }, [selectedIds])

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
    setSelectedIds((prev) => {
      const oldIndex = prev.indexOf(activeId)
      const newIndex = prev.indexOf(overId)
      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return prev

      const next = [...prev]
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
    catalog: QUICK_TOOL_CATALOG,
    toggleTool,
    moveTool,
    reorderTools,
    restoreDefaults,
    minTools: MIN_QUICK_TOOLS,
  }
}
