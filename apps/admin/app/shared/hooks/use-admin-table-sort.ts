import { useCallback, useState } from 'react'

export type AdminSortDirection = 'asc' | 'desc'

export type AdminSortState<T extends string> = {
  key: T
  direction: AdminSortDirection
} | null

export function useAdminTableSort<T extends string>() {
  const [sort, setSort] = useState<AdminSortState<T>>(null)

  const toggleSort = useCallback((key: T) => {
    setSort((current) => {
      if (current?.key !== key) {
        return { key, direction: 'asc' }
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }, [])

  const clearSort = useCallback(() => {
    setSort(null)
  }, [])

  return { sort, toggleSort, clearSort }
}

export function sortAdminTableRows<T, K extends string>(
  rows: T[],
  sort: AdminSortState<K>,
  accessors: Record<K, (row: T) => string | number>,
): T[] {
  if (!sort) return rows

  const readValue = accessors[sort.key]
  if (!readValue) return rows

  const direction = sort.direction === 'asc' ? 1 : -1

  return [...rows].sort((left, right) => {
    const leftValue = readValue(left)
    const rightValue = readValue(right)
    if (leftValue < rightValue) return -1 * direction
    if (leftValue > rightValue) return 1 * direction
    return 0
  })
}
