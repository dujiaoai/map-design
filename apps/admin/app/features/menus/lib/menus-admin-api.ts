import { api } from '~/shared/api/client'

export interface AdminMenuItem {
  id: string
  sectionId: string | null
  title: string
  kind: string
  icon: string | null
  toolId: string | null
  moduleId: string | null
  url: string | null
  href: string | null
  tenantFeature: string | null
  permissionCode: string | null
  sortOrder: number
  enabled: boolean
}

export interface AdminMenuSection {
  id: string
  label: string
  collapsible: boolean
  defaultOpen: boolean
  storageKey: string | null
  sortOrder: number
  enabled: boolean
  items: AdminMenuItem[]
}

export interface AdminMenusResponse {
  sections: AdminMenuSection[]
  toolItems: AdminMenuItem[]
}

export interface AdminMenuItemUpdate {
  id: string
  title: string
  sortOrder: number
  enabled: boolean
}

export interface AdminMenuSectionUpdate {
  id: string
  label: string
  sortOrder: number
  enabled: boolean
  items: AdminMenuItemUpdate[]
}

export interface UpdateWorkspaceMenusRequest {
  sections: AdminMenuSectionUpdate[]
  toolItems: AdminMenuItemUpdate[]
}

export function fetchAdminMenus() {
  return api.get<AdminMenusResponse>('/admin/menus')
}

export function updateAdminMenus(body: UpdateWorkspaceMenusRequest) {
  return api.put<AdminMenusResponse>('/admin/menus', body)
}
