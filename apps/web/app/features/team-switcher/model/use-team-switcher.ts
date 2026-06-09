import { useSession } from '@repo/auth'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { switchTenantBySlug } from '~/features/team-switcher/lib/switch-tenant'
import { tenantSummariesToTeams } from '~/features/team-switcher/lib/tenant-team-mapper'
import { usesSaasSessionBootstrap } from '~/shared/session/fetch-saas-session'
import { useTenantsQuery } from '~/shared/queries/tenant-queries'

export function useTeamSwitcher() {
  const navigate = useNavigate()
  const saasTeams = usesSaasSessionBootstrap()
  const { session } = useSession()
  const tenantsQuery = useTenantsQuery(saasTeams)
  const [switching, setSwitching] = useState(false)

  const teams = useMemo(() => {
    if (!tenantsQuery.data?.items.length) return []
    return tenantSummariesToTeams(tenantsQuery.data.items)
  }, [tenantsQuery.data?.items])

  const activeTeamId =
    session?.tenant?.id ?? tenantsQuery.data?.items.find((item) => item.current)?.id

  async function onTeamChange(teamId: string) {
    if (switching) return

    const target = tenantsQuery.data?.items.find((item) => item.id === teamId)
    if (!target || target.current) return

    setSwitching(true)
    try {
      const result = await switchTenantBySlug(target.slug)
      if (result === 'redirect-login') {
        const params = new URLSearchParams({ tenant: target.slug, reason: 'switch' })
        void navigate(`/login?${params.toString()}`, { replace: true })
      }
    } finally {
      setSwitching(false)
    }
  }

  return {
    teams,
    activeTeamId,
    onTeamChange: saasTeams && teams.length > 0 ? onTeamChange : undefined,
    showTeamSwitcher: saasTeams && teams.length > 0,
    isLoading: saasTeams && tenantsQuery.isPending,
    switching,
  }
}
