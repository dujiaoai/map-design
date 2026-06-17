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
