import { api } from '~/shared/api/client'

import type {
  AdminAuditWebhookTargetListResponse,
  AdminPingResponse,
  AdminStatsResponse,
  AdminSystemDependenciesResponse,
  AdminSystemFlagsResponse,
  AdminUsageAnomaliesResponse,
  AdminUsageTrendsResponse,
} from './model'

export function fetchAdminPing() {
  return api.get<AdminPingResponse>('/admin/ping')
}

export function fetchAdminStats() {
  return api.get<AdminStatsResponse>('/admin/stats')
}

export function fetchAdminUsageTrends() {
  return api.get<AdminUsageTrendsResponse>('/admin/stats/usage-trends')
}

export function fetchAdminUsageAnomalies() {
  return api.get<AdminUsageAnomaliesResponse>('/admin/stats/usage-anomalies')
}

export function fetchAuditWebhookTargets() {
  return api.get<AdminAuditWebhookTargetListResponse>('/admin/audit-logs/webhook-targets')
}

export function fetchAdminSystemFlags() {
  return api.get<AdminSystemFlagsResponse>('/admin/system/flags')
}

export function fetchAdminSystemDependencies() {
  return api.get<AdminSystemDependenciesResponse>('/admin/system/dependencies')
}
