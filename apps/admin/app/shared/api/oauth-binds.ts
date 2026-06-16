import { api } from './client'

export interface UserOauthBindItem {
  providerId: string
  providerDisplayName: string
  emailSnapshot: string | null
  createdAt: string
  lastUsedAt: string
}

export interface UserOauthBindsResponse {
  binds: UserOauthBindItem[]
}

export function fetchMyOauthBinds() {
  return api.get<UserOauthBindsResponse>('/users/me/oauth-binds')
}

export function unbindMyOauthProvider(providerId: string) {
  return api.delete<void>(`/users/me/oauth-binds/${encodeURIComponent(providerId)}`)
}
