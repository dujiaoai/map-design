import { useMutation, useQueryClient } from '@tanstack/react-query'
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

export type CreateLayerInput = {
  name: string
  layerType: string
  visible?: boolean
  sortOrder?: number
}

export type UpdateLayerInput = {
  name: string
  layerType: string
  visible: boolean
  sortOrder: number
}

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

export async function createMapLayer(input: CreateLayerInput) {
  return layerDtoSchema.parse(await api.post<MapLayerSummary>('/layers', input))
}

export async function updateMapLayer(layerId: string, input: UpdateLayerInput) {
  return layerDtoSchema.parse(await api.put<MapLayerSummary>(`/layers/${layerId}`, input))
}

export async function deleteMapLayer(layerId: string) {
  await api.delete(`/layers/${layerId}`)
}

export function useCreateLayerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMapLayer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: layerQueryKeys.list() }),
  })
}

export function useUpdateLayerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ layerId, input }: { layerId: string; input: UpdateLayerInput }) =>
      updateMapLayer(layerId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: layerQueryKeys.list() }),
  })
}

export function useDeleteLayerMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMapLayer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: layerQueryKeys.list() }),
  })
}
