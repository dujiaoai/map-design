import { sessionSchema, type Session } from '@repo/auth'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { api } from '~/shared/api/client'
import { auth } from '~/shared/auth/instance'
import { sessionQueryKeys } from '~/shared/queries/session-queries'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
import { persistAuthSession } from '~/shared/session/persist-auth-session'

import type { ProfileFormValues } from './account-schemas'

export function useUpdateUserProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const name = values.name.trim()
      const phone = values.phone?.trim() || null
      const avatarUrl = values.avatarUrl?.trim() || null

      if (!usesSaasSessionBootstrap()) {
        const current = auth.getSession()
        if (!current) throw new Error('未登录')
        const updated: Session = {
          ...current,
          user: { ...current.user, name, phone, avatarUrl },
        }
        persistAuthSession(updated)
        return updated
      }

      const session = sessionSchema.parse(
        await api.put<Session>('/users/me', { name, phone, avatarUrl }),
      )
      persistAuthSession(session)
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
