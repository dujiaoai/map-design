import { useMemo, useState } from 'react'

export interface AdminTableFilterState {
  search: string
  setSearch: (value: string) => void
  status: string
  setStatus: (value: string) => void
}

export function useAdminTableFilterState(defaultStatus = 'all'): AdminTableFilterState {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState(defaultStatus)
  return { search, setSearch, status, setStatus }
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase()
}

function readFieldValue<T extends object>(item: T, key: keyof T): string {
  const raw = item[key]
  if (raw == null) return ''
  return String(raw)
}

function matchesSearch<T extends object>(item: T, query: string, keys: (keyof T)[]): boolean {
  if (!query) return true
  return keys.some((key) => readFieldValue(item, key).toLowerCase().includes(query))
}

export function filterAdminTableRows<T extends object>(
  rows: T[] | undefined,
  options: {
    search: string
    searchKeys: (keyof T)[]
    status?: string
    statusKey?: keyof T
    statusAllValue?: string
  },
): T[] {
  if (!rows?.length) return []
  const query = normalizeSearch(options.search)
  const status = options.status ?? 'all'
  const statusAll = options.statusAllValue ?? 'all'

  return rows.filter((row) => {
    const searchOk = matchesSearch(row, query, options.searchKeys)
    if (!searchOk) return false
    if (!options.statusKey || status === statusAll) return true
    return readFieldValue(row, options.statusKey) === status
  })
}

export function useFilteredAdminRows<T extends object>(
  rows: T[] | undefined,
  filter: AdminTableFilterState,
  searchKeys: (keyof T)[],
  statusKey?: keyof T,
): T[] {
  return useMemo(
    () =>
      filterAdminTableRows(rows, {
        search: filter.search,
        searchKeys,
        status: filter.status,
        statusKey,
      }),
    [rows, filter.search, filter.status, searchKeys, statusKey],
  )
}
