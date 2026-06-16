import { api } from '~/shared/api/client'

import type { AdminPingResponse, AdminStatsResponse, AdminSystemFlagsResponse } from './model'

export function fetchAdminPing() {
  return api.get<AdminPingResponse>('/admin/ping')
}

export function fetchAdminStats() {
  return api.get<AdminStatsResponse>('/admin/stats')
}

export function fetchAdminSystemFlags() {
  return api.get<AdminSystemFlagsResponse>('/admin/system/flags')
}
