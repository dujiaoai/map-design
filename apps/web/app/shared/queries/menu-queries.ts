import { getMenuRouters } from '@repo/ruoyi-api'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { ruoyi } from '~/shared/queries/ruoyi-client'

export const menuQueryKeys = {
  all: ['menu'] as const,
  routers: () => [...menuQueryKeys.all, 'routers'] as const,
}

export function menuRoutersQueryOptions() {
  return queryOptions({
    queryKey: menuQueryKeys.routers(),
    queryFn: () => getMenuRouters(ruoyi),
    staleTime: 10 * 60_000,
  })
}

export function useMenuRoutersQuery() {
  return useQuery(menuRoutersQueryOptions())
}
