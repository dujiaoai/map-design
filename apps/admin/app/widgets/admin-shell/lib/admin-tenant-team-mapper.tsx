import type { TeamSwitcherTeam } from '@repo/ui'
import { Building2Icon } from 'lucide-react'

import type { SessionTenantSummary } from '~/shared/api/admin-api'

export function adminTenantsToTeams(items: SessionTenantSummary[]): TeamSwitcherTeam[] {
  return items.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    logo: <Building2Icon className="size-4" aria-hidden />,
    plan: tenant.slug,
  }))
}
