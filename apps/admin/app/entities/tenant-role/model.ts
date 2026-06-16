export interface TenantRoleSummary {
  id: string
  code: string
  name: string
  description?: string | null
  system: boolean
  permissionCount: number
  memberCount: number
}

export interface TenantRoleListResponse {
  roles: TenantRoleSummary[]
}

export interface AssignableRoleSummary {
  id: string
  code: string
  name: string
  system: boolean
}

export interface AssignableRoleListResponse {
  roles: AssignableRoleSummary[]
}

export interface CreateTenantRolePayload {
  code: string
  name: string
  description?: string
  permissionCodes?: string[]
}
