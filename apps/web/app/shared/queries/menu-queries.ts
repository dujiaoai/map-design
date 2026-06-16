import { queryOptions, useQuery } from '@tanstack/react-query'

import { fetchWorkspaceMenus } from '~/shared/api/menus'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const menuQueryKeys = {
  all: ['menus'] as const,
  workspace: () => [...menuQueryKeys.all, 'workspace'] as const,
}

export function workspaceMenusQueryOptions() {
  return queryOptions({
    queryKey: menuQueryKeys.workspace(),
    queryFn: fetchWorkspaceMenus,
    staleTime: 60_000,
  })
}

export function useWorkspaceMenusQuery(enabled = true) {
  return useQuery({
    ...workspaceMenusQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap(),
  })
}
