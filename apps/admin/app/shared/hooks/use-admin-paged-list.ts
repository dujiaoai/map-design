import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export interface AdminListQueryParams {
  q?: string
  page: number
  size: number
}

export const ADMIN_LIST_PAGE_SIZE = 20

export function useAdminPagedListState(initialSearch = '') {
  const [searchInput, setSearchInput] = useState(initialSearch)
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const queryParams: AdminListQueryParams = {
    q: debouncedSearch || undefined,
    page,
    size: ADMIN_LIST_PAGE_SIZE,
  }

  return {
    searchInput,
    setSearchInput,
    page,
    setPage,
    queryParams,
  }
}

export function useAdminPagedQuery<T>({
  queryKey,
  queryFn,
  enabled = true,
}: {
  queryKey: readonly unknown[]
  queryFn: () => Promise<T>
  enabled?: boolean
}) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    placeholderData: keepPreviousData,
  })
}
