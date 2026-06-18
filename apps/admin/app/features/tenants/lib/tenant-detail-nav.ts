export const TENANT_DETAIL_TABS = ['info', 'members', 'custom-roles', 'features', 'compliance'] as const

export type TenantDetailTab = (typeof TENANT_DETAIL_TABS)[number]

export function parseTenantDetailTab(
  value: string | null,
  fallback: TenantDetailTab = 'info',
): TenantDetailTab {
  if (
    value === 'info' ||
    value === 'members' ||
    value === 'custom-roles' ||
    value === 'features' ||
    value === 'compliance'
  ) {
    return value
  }
  return fallback
}

export function resolveTenantDetailTab(
  value: string | null,
  options: { canReadMembers: boolean },
): TenantDetailTab {
  const parsed = parseTenantDetailTab(value)
  if (parsed === 'members' || parsed === 'custom-roles') {
    return options.canReadMembers ? parsed : 'info'
  }
  return parsed
}
