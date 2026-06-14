import type { TeamSwitcherTeam } from '@repo/ui'

import type { TenantSummary } from '~/shared/queries/tenant-queries'

import { formatTenantPlan } from './format-tenant-plan'
import { TenantLogo } from '../ui/tenant-logo'

export function tenantSummariesToTeams(items: TenantSummary[]): TeamSwitcherTeam[] {
  return items.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    logo: <TenantLogo />,
    plan: tenant.kind === 'personal' ? '个人空间' : formatTenantPlan(tenant.plan),
  }))
}
