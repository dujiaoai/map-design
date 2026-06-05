import { getUserInfo, getUserProfile } from '@repo/ruoyi-api'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { ruoyi } from '~/shared/queries/ruoyi-client'

export const userQueryKeys = {
  all: ['user'] as const,
  info: () => [...userQueryKeys.all, 'info'] as const,
  profile: () => [...userQueryKeys.all, 'profile'] as const,
}

export function userInfoQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.info(),
    queryFn: () => getUserInfo(ruoyi),
    staleTime: 5 * 60_000,
  })
}

export function useUserInfoQuery() {
  return useQuery(userInfoQueryOptions())
}

export function userProfileQueryOptions() {
  return queryOptions({
    queryKey: userQueryKeys.profile(),
    queryFn: () => getUserProfile(ruoyi),
    staleTime: 60_000,
  })
}

export function useUserProfileQuery(enabled = true) {
  return useQuery({
    ...userProfileQueryOptions(),
    enabled,
  })
}
