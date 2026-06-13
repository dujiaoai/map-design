import { queryOptions, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

import { api } from '~/shared/api/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const layerDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  layerType: z.string(),
  visible: z.boolean(),
  sortOrder: z.number(),
})

export const layerListResponseSchema = z.object({
  items: z.array(layerDtoSchema),
})

export type MapLayerSummary = z.infer<typeof layerDtoSchema>

export const layerQueryKeys = {
  all: ['layers'] as const,
  list: () => [...layerQueryKeys.all, 'list'] as const,
}

export function layersQueryOptions() {
  return queryOptions({
    queryKey: layerQueryKeys.list(),
    queryFn: async () =>
      layerListResponseSchema.parse(await api.get<{ items: MapLayerSummary[] }>('/layers')),
    staleTime: 30_000,
  })
}

export function useLayersQuery(enabled = true) {
  return useQuery({
    ...layersQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap(),
  })
}
