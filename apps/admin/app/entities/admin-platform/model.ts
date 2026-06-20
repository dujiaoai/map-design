export interface AdminPingResponse {
  status: string
  authenticated: boolean
  platformAdmin: boolean
}

export interface AdminStatsResponse {
  tenantCount: number
  userCount: number
  activeTenantCount: number
  activeTenantsLast7Days: number
  newUsersLast7Days: number
  suspendedTenantCount: number
  trialActiveTenantCount: number
  trialExpiredTenantCount: number
}

export interface AdminUsageDayBucket {
  date: string
  newUsers: number
  auditEvents: number
  activeTenants: number
  billingApiCallsPerDay?: number
  billingReconcileDiffsPerDay?: number
}

export interface AdminUsageTrendsResponse {
  days: AdminUsageDayBucket[]
}

export interface AdminUsageAnomaly {
  metric: string
  currentValue: number
  sevenDayAverage: number
  ratio: number
  day: string
}

export interface AdminUsageAnomaliesResponse {
  anomalies: AdminUsageAnomaly[]
}

export interface AdminUsageForecastDay {
  date: string
  metric: string
  projectedValue: number
}

export interface AdminUsageForecastResponse {
  newUsers: AdminUsageForecastDay[]
  auditEvents: AdminUsageForecastDay[]
  billingApiCalls: AdminUsageForecastDay[]
}

export interface AdminUsageCapacityRecommendation {
  category: string
  action: string
  projectedAverage: number
  rationale: string
}

export interface AdminUsageForecastBundleResponse {
  forecast: AdminUsageForecastResponse
  recommendations: AdminUsageCapacityRecommendation[]
}

export interface AdminFinOpsTenantConsumer {
  tenantId: string
  tenantName: string
  estimatedMonthlyCostUsd: number
  billingApiCalls: number
  seatCount: number
}

export interface AdminFinOpsCostAttribution {
  totalEstimatedMonthlyCostUsd: number
  billingApiCostUsd: number
  seatCostUsd: number
  storageCostUsd: number
  topConsumers: AdminFinOpsTenantConsumer[]
}

export interface AdminFinOpsBudgetStatus {
  monthlyBudgetUsd: number
  estimatedMonthlyCostUsd: number
  utilizationPercent: number
  alert: boolean
  overBudget: boolean
  throttleActive: boolean
}

export interface AdminAuditWebhookSelfHealStatus {
  degradedTargetCount: number
  eligibleForSelfHealCount: number
  deliveryRatePercent: number
  pendingDeadLetters: number
}

export interface ScimSyncEventSummary {
  pendingCount: number
  tenantPendingCount: number
  conflictStrategy: string
}

export interface AdminAuditWebhookTarget {
  id: string
  url: string
  format: string
  enabled: boolean
  priority: number
  createdAt: number
  consecutiveFailures: number
  lastHealthCheckAt: number | null
  unhealthySince: number | null
}

export interface AdminAuditWebhookTargetListResponse {
  primaryWebhookUrl: string
  targets: AdminAuditWebhookTarget[]
}

export interface AdminSystemFlagsResponse {
  registration: {
    allowPublicOrgSignup: boolean
    allowPublicPersonalSignup: boolean
    registrationTokenTtl: string
  }
  auth: {
    passwordStrengthEnabled: boolean
  }
  mail: {
    enabled: boolean
    fromAddress: string
    outboundReady: boolean
  }
  rateLimit: {
    enabled: boolean
    loginIpMaxAttempts: number
    loginAccountMaxAttempts: number
  }
  tenantRls: {
    enabled: boolean
  }
  billing: {
    integrationEnabled: boolean
    baseUrl: string
    membershipPushEnabled: boolean
  }
  mfa: {
    enforcementEnabled: boolean
    totpEnrollmentAvailable: boolean
    enrolledPlatformAdminCount: number
  }
  oidc: {
    enabled: boolean
    authorizationCodeFlowAvailable: boolean
    configuredProviderCount: number
  }
  audit: {
    webhookEnabled: boolean
    webhookConfigured: boolean
    webhookFormat: string
    deliveryMode: string
    retentionDays: number
  }
  runtime: {
    activeProfiles: string[]
    jwtPermEpoch: number
  }
}

export type AdminDependencyStatus = 'UP' | 'DOWN' | 'DISABLED' | 'UNKNOWN'

export interface AdminSystemDependenciesResponse {
  edges: Array<{
    from: string
    to: string
    kind: string
  }>
  nodes: Array<{
    id: string
    label: string
    status: AdminDependencyStatus
    url: string | null
    detail: string
  }>
}

export interface AdminNavigationItem {
  to: string
  label: string
  permissions: string[]
}

export interface AdminNavigationSection {
  id: string
  label: string
  items: AdminNavigationItem[]
}

export interface AdminNavigationResponse {
  productCode: string
  sections: AdminNavigationSection[]
}
