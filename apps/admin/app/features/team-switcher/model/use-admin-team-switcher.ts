import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'

import { switchTenantBySlug } from '~/features/team-switcher/lib/switch-tenant'
import { fetchSessionTenants } from '~/shared/api/admin-api'
import { auth } from '~/shared/auth/client'
import { isSaasAuthEnabled } from '~/shared/config/saas-auth-enabled'
import { adminQueryKeys } from '~/shared/lib/admin-query-keys'

export function useAdminTeamSwitcher() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = auth.getSession()
  const saasEnabled = isSaasAuthEnabled()

  const tenantsQuery = useQuery({
    queryKey: adminQueryKeys.sessionTenants,
    queryFn: fetchSessionTenants,
    enabled: saasEnabled && auth.isAuthenticated(),
    staleTime: 60_000,
  })

  const teams = tenantsQuery.data?.items ?? []
  const showTeamSwitcher = teams.length > 1

  async function onTeamChange(tenantId: string) {
    const target = teams.find((item) => item.id === tenantId)
    if (!target) return

    const result = await switchTenantBySlug(target.slug)
    if (result === 'redirect-login') {
      void navigate('/login', { replace: true })
      return
    }

    await queryClient.invalidateQueries()
    window.location.reload()
  }

  return {
    teams,
    activeTeamId: session?.tenant?.id,
    showTeamSwitcher,
    onTeamChange,
    isLoading: tenantsQuery.isLoading,
  }
}
