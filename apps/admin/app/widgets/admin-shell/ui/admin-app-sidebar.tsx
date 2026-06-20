import { useSession } from '@repo/auth'
import { AppSidebar as UiAppSidebar } from '@repo/ui'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useAdminTeamSwitcher } from '~/features/team-switcher/model/use-admin-team-switcher'

import { adminTenantsToTeams } from '../lib/admin-tenant-team-mapper'
import { buildAdminNavSections } from '../lib/build-admin-nav-sections'
import { AdminBrandLogo } from './admin-brand-logo'
import { adminBrand } from '~/shared/config/admin-brand'

export function AdminAppSidebar() {
  const session = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { teams, activeTeamId, showTeamSwitcher, onTeamChange } = useAdminTeamSwitcher()

  const navMapSections = useMemo(
    () => buildAdminNavSections(pathname, session),
    [pathname, session],
  )

  const teamSwitcherTeams = useMemo(() => adminTenantsToTeams(teams), [teams])

  const handleNavSelect = useCallback(
    (id: string) => {
      void navigate(id)
    },
    [navigate],
  )

  const brandSubtitle = session?.tenant?.slug ?? session?.tenant?.name

  return (
    <UiAppSidebar
      hideFooter
      hideNotifications
      brand={
        showTeamSwitcher
          ? undefined
          : {
              logo: <AdminBrandLogo />,
              title: '运营控制台',
              subtitle: brandSubtitle,
            }
      }
      teams={showTeamSwitcher ? teamSwitcherTeams : undefined}
      activeTeamId={activeTeamId}
      onTeamChange={(tenantId) => void onTeamChange(tenantId)}
      navMapSections={navMapSections}
      onNavSelect={handleNavSelect}
    />
  )
}
