import { api } from '~/shared/api/client'

import type {
  AdminAuditWebhookTargetListResponse,
  AdminPingResponse,
  AdminStatsResponse,
  AdminSystemDependenciesResponse,
  AdminSystemFlagsResponse,
  AdminUsageAnomaliesResponse,
  AdminUsageForecastBundleResponse,
  AdminFinOpsCostAttribution,
  AdminFinOpsBudgetStatus,
  AdminAuditWebhookSelfHealStatus,
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

export function fetchAdminUsageForecast() {
  return api.get<AdminUsageForecastBundleResponse>('/admin/stats/usage-forecast')
}

export function fetchAdminFinOps() {
  return api.get<AdminFinOpsCostAttribution>('/admin/stats/finops')
}

export function fetchAdminFinOpsBudgetStatus() {
  return api.get<AdminFinOpsBudgetStatus>('/admin/stats/finops/budget-status')
}

export function fetchAdminAuditWebhookSelfHealStatus() {
  return api.get<AdminAuditWebhookSelfHealStatus>('/admin/audit-logs/webhook-sla/self-heal-status')
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
