import { useCallback, useEffect, useMemo, useState } from 'react'

export type AdminTableColumnDef = {
  key: string
  label: string
  defaultVisible?: boolean
}

const STORAGE_PREFIX = 'admin-table-columns:'

function readColumnPrefs(
  tableId: string,
  defaults: Record<string, boolean>,
): Record<string, boolean> {
  if (typeof window === 'undefined') return defaults
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${tableId}`)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return { ...defaults, ...parsed }
  } catch {
    return defaults
  }
}

function writeColumnPrefs(tableId: string, visible: Record<string, boolean>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(`${STORAGE_PREFIX}${tableId}`, JSON.stringify(visible))
}

function buildDefaultVisibility(columns: AdminTableColumnDef[]) {
  return Object.fromEntries(columns.map((col) => [col.key, col.defaultVisible !== false]))
}

function buildColumnsSignature(columns: AdminTableColumnDef[]) {
  return columns
    .map((col) => `${col.key}:${col.defaultVisible === false ? 0 : 1}:${col.label}`)
    .join('|')
}

export function useAdminTableColumnPrefs(tableId: string, columns: AdminTableColumnDef[]) {
  const columnsSignature = useMemo(() => buildColumnsSignature(columns), [columns])

  const defaults = useMemo(
    () => buildDefaultVisibility(columns),
    // columnsSignature 稳定化内联 [...COLUMNS] 导致的引用抖动
    [columnsSignature],
  )

  const [visible, setVisible] = useState<Record<string, boolean>>(() =>
    readColumnPrefs(tableId, buildDefaultVisibility(columns)),
  )

  useEffect(() => {
    setVisible(readColumnPrefs(tableId, defaults))
  }, [tableId, columnsSignature, defaults])

  const isColumnVisible = useCallback(
    (key: string) => visible[key] ?? defaults[key] ?? true,
    [defaults, visible],
  )

  const setColumnVisible = useCallback(
    (key: string, next: boolean) => {
      setVisible((current) => {
        const updated = { ...current, [key]: next }
        const visibleCount = columns.filter((col) => updated[col.key] ?? defaults[col.key]).length
        if (visibleCount === 0) return current
        writeColumnPrefs(tableId, updated)
        return updated
      })
    },
    [columns, defaults, tableId],
  )

  const resetColumns = useCallback(() => {
    writeColumnPrefs(tableId, defaults)
    setVisible(defaults)
  }, [defaults, tableId])

  return {
    columns,
    visible,
    isColumnVisible,
    setColumnVisible,
    resetColumns,
  }
}
