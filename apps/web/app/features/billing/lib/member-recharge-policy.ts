import { hasRole, SaaSRole, type SessionUser } from '@repo/auth'

import { TenantFeatureCodes } from '~/features/billing/lib/tenant-feature-codes'

export function canMemberSelfRecharge(
  user: SessionUser | undefined,
  enabledTenantFeatures: ReadonlySet<string>,
): boolean {
  if (!user) return false
  if (hasRole(user.roles, SaaSRole.TENANT_ADMIN)) return true
  return !enabledTenantFeatures.has(TenantFeatureCodes.MEMBERS_RECHARGE_DISABLED)
}
