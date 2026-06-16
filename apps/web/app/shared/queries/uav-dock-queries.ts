import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '~/shared/api/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const uavDockDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  locationLabel: z.string().nullable().optional(),
  droneCount: z.number(),
  status: z.enum(['online', 'offline']).or(z.string()),
  batteryPercent: z.number().nullable().optional(),
  sortOrder: z.number(),
})

export const uavDockListResponseSchema = z.object({
  items: z.array(uavDockDtoSchema),
})

export type UavDockSummary = z.infer<typeof uavDockDtoSchema>

export const uavDockQueryKeys = {
  all: ['uav-docks'] as const,
  list: () => [...uavDockQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...uavDockQueryKeys.all, 'detail', id] as const,
}

export function uavDocksQueryOptions() {
  return queryOptions({
    queryKey: uavDockQueryKeys.list(),
    queryFn: async () =>
      uavDockListResponseSchema.parse(
        await api.get<{ items: UavDockSummary[] }>('/uav/docks'),
      ),
    staleTime: 30_000,
  })
}

export function useUavDocksQuery(enabled = true) {
  return useQuery({
    ...uavDocksQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap(),
  })
}

export function uavDockDetailQueryOptions(dockId: string) {
  return queryOptions({
    queryKey: uavDockQueryKeys.detail(dockId),
    queryFn: async () => uavDockDtoSchema.parse(await api.get<UavDockSummary>(`/uav/docks/${dockId}`)),
    staleTime: 30_000,
  })
}

export function useUavDockQuery(dockId: string | null, enabled = true) {
  return useQuery({
    ...uavDockDetailQueryOptions(dockId ?? ''),
    enabled: enabled && Boolean(dockId) && usesSaasSessionBootstrap(),
  })
}
