import { sessionSchema, type Session } from '@repo/auth'

import type { UserOauthBindsResponse } from '~/entities/user'
import { api } from '~/shared/api/client'

import type { SessionTenantListResponse } from './model'

export function fetchSessionTenants() {
  return api.get<SessionTenantListResponse>('/tenants')
}

export async function updateAccountProfile(values: {
  name: string
  phone?: string | null
  avatarUrl?: string | null
}) {
  const session = sessionSchema.parse(
    await api.put<Session>('/users/me', {
      name: values.name,
      phone: values.phone ?? null,
      avatarUrl: values.avatarUrl ?? null,
    }),
  )
  return session
}

export function updateAccountPassword(oldPassword: string, newPassword: string) {
  return api.post('/users/me/password', { oldPassword, newPassword })
}

export function fetchMyOauthBinds() {
  return api.get<UserOauthBindsResponse>('/users/me/oauth-binds')
}

export function unbindMyOauthProvider(providerId: string) {
  return api.delete<void>(`/users/me/oauth-binds/${encodeURIComponent(providerId)}`)
}
