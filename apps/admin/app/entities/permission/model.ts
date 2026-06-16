export interface AdminPermission {
  id: string
  code: string
  name: string
  description: string
  scope: 'platform' | 'tenant' | 'workspace'
  moduleId: string | null
  moduleCode: string | null
  moduleName: string | null
  system: boolean
}

export interface AdminPermissionListResponse {
  permissions: AdminPermission[]
}

export interface AdminPermissionModule {
  id: string
  code: string
  name: string
  description: string | null
  scope: 'platform' | 'tenant' | 'workspace'
  system: boolean
  sortOrder: number
  permissions: AdminPermission[]
}

export interface AdminPermissionModuleListResponse {
  modules: AdminPermissionModule[]
}
