import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '~/shared/api/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const tenantSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  plan: z.string(),
  current: z.boolean(),
})

export const tenantListResponseSchema = z.object({
  items: z.array(tenantSummarySchema),
})

export type TenantSummary = z.infer<typeof tenantSummarySchema>

export const tenantQueryKeys = {
  all: ['tenants'] as const,
  list: () => [...tenantQueryKeys.all, 'list'] as const,
}

export function tenantsQueryOptions() {
  return queryOptions({
    queryKey: tenantQueryKeys.list(),
    queryFn: async () =>
      tenantListResponseSchema.parse(await api.get<{ items: TenantSummary[] }>('/tenants')),
    staleTime: 60_000,
  })
}

export function useTenantsQuery(enabled = true) {
  return useQuery({
    ...tenantsQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap(),
  })
}
