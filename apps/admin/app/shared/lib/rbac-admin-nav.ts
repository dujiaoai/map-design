export type RbacAdminPage = 'permissions' | 'roles' | 'tenant-roles'

export const RBAC_ADMIN_FROM_VALUES = ['permissions', 'roles', 'tenant-roles'] as const
export type RbacAdminNavFrom = (typeof RBAC_ADMIN_FROM_VALUES)[number]

const RBAC_ADMIN_PATHS: Record<RbacAdminPage, string> = {
  permissions: '/permissions',
  roles: '/roles',
  'tenant-roles': '/tenant-roles',
}

const RBAC_ADMIN_BACK_LABELS: Record<RbacAdminNavFrom, string> = {
  permissions: '返回权限目录',
  roles: '返回系统角色',
  'tenant-roles': '返回自定义角色',
}

export function parseRbacAdminNavFrom(value: string | null): RbacAdminNavFrom | null {
  if (value && RBAC_ADMIN_FROM_VALUES.includes(value as RbacAdminNavFrom)) {
    return value as RbacAdminNavFrom
  }
  return null
}

function appendReturnContext(
  target: RbacAdminNavFrom,
  searchParams: URLSearchParams,
): URLSearchParams {
  const params = new URLSearchParams()

  switch (target) {
    case 'permissions': {
      const returnModule = searchParams.get('returnModule')
      if (returnModule) params.set('module', returnModule)
      break
    }
    case 'roles': {
      const returnRole = searchParams.get('returnRole')
      if (returnRole) params.set('role', returnRole)
      break
    }
    case 'tenant-roles': {
      const returnTenantId = searchParams.get('returnTenantId')
      const returnRoleId = searchParams.get('returnRoleId')
      if (returnTenantId) params.set('tenantId', returnTenantId)
      if (returnRoleId) params.set('roleId', returnRoleId)
      break
    }
  }

  return params
}

export function buildRbacAdminCrossLink(
  target: RbacAdminPage,
  from: RbacAdminPage,
  searchParams: URLSearchParams,
  extra?: { tenantId?: string },
): string {
  const params = new URLSearchParams()
  params.set('from', from)

  if (from === 'permissions') {
    const module = searchParams.get('module')
    if (module) params.set('returnModule', module)
  }
  if (from === 'roles') {
    const role = searchParams.get('role')
    if (role) params.set('returnRole', role)
  }
  if (from === 'tenant-roles') {
    const tenantId = extra?.tenantId ?? searchParams.get('tenantId')
    const roleId = searchParams.get('roleId')
    if (tenantId) params.set('returnTenantId', tenantId)
    if (roleId) params.set('returnRoleId', roleId)
  }

  if (target === 'tenant-roles') {
    const tenantId = extra?.tenantId ?? searchParams.get('tenantId')
    if (tenantId) params.set('tenantId', tenantId)
  }

  const query = params.toString()
  return query ? `${RBAC_ADMIN_PATHS[target]}?${query}` : RBAC_ADMIN_PATHS[target]
}

export function resolveRbacAdminBackLink(
  searchParams: URLSearchParams,
  fallback?: { to: string; label: string },
): { to: string; label: string } {
  const from = parseRbacAdminNavFrom(searchParams.get('from'))
  if (from) {
    const params = appendReturnContext(from, searchParams)
    const query = params.toString()
    const base = RBAC_ADMIN_PATHS[from]
    return {
      to: query ? `${base}?${query}` : base,
      label: RBAC_ADMIN_BACK_LABELS[from],
    }
  }

  return fallback ?? { to: '/', label: '返回概览' }
}
