import { sessionSchema, type Session } from '@repo/auth'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { api } from '~/shared/api/client'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'

export const sessionQueryKeys = {
  all: ['session'] as const,
  me: () => [...sessionQueryKeys.all, 'me'] as const,
}

export function sessionQueryOptions() {
  return queryOptions({
    queryKey: sessionQueryKeys.me(),
    queryFn: async () => sessionSchema.parse(await api.get<Session>('/users/me')),
    staleTime: 60_000,
  })
}

export function useSessionQuery(enabled = true) {
  return useQuery({
    ...sessionQueryOptions(),
    enabled: enabled && usesSaasSessionBootstrap(),
  })
}
