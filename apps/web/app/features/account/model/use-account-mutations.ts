import { sessionSchema, type Session } from '@repo/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useRuoYiProfileStore } from '~/entities/ruoyi-user'
import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/instance'
import { sessionQueryKeys } from '~/shared/queries/session-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
import { sessionToRuoYiUserInfo } from '~/shared/session/saas-session-profile'

import type { ProfileFormValues } from './account-schemas'

function persistSessionAndProfile(session: Session) {
  const token = auth.getAccessToken()
  if (token) {
    auth.setSession(session, {
      accessToken: token,
      refreshToken: auth.getRefreshToken() ?? undefined,
      expiresAt: session.expiresAt,
    })
  }
  useRuoYiProfileStore.getState().setProfile(sessionToRuoYiUserInfo(session))
}

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const name = values.name.trim()

      if (!usesSaasSessionBootstrap()) {
        const current = auth.getSession()
        if (!current) throw new Error('未登录')
        const updated: Session = {
          ...current,
          user: { ...current.user, name },
        }
        persistSessionAndProfile(updated)
        return updated
      }

      const session = sessionSchema.parse(await api.put<Session>('/users/me', { name }))
      persistSessionAndProfile(session)
      return session
    },
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKeys.me(), session)
    },
  })
}

export function useUpdateUserPasswordMutation() {
  return useMutation({
    mutationFn: async (values: { oldPassword: string; newPassword: string }) => {
      if (!usesSaasSessionBootstrap()) {
        throw new Error('改密需配置 VITE_API_URL 并连接 SaaS API')
      }

      await api.post('/users/me/password', {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      })
    },
    onSuccess: () => {
      auth.clearRefreshToken()
    },
  })
}
