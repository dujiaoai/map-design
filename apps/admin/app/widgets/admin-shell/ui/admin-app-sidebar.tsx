import { useSession } from '@repo/auth'
import { AppSidebar as UiAppSidebar } from '@repo/ui'
import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { useAdminTeamSwitcher } from '~/features/team-switcher/model/use-admin-team-switcher'
import { useAdminNavigation } from '~/shared/hooks/use-admin-navigation'
import { adminBrand } from '~/shared/config/admin-brand'

import { adminTenantsToTeams } from '../lib/admin-tenant-team-mapper'
import { AdminBrandLogo } from './admin-brand-logo'
import { AdminProductSelector } from './admin-product-selector'

export function AdminAppSidebar() {
  const session = useSession()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { teams, activeTeamId, showTeamSwitcher, onTeamChange } = useAdminTeamSwitcher()
  const { navMapSections } = useAdminNavigation(pathname, session)

  const teamSwitcherTeams = adminTenantsToTeams(teams)

  const handleNavSelect = useCallback(
    (id: string) => {
      void navigate(id)
    },
    [navigate],
  )

  const brandSubtitle = session?.tenant?.slug ?? session?.tenant?.name

  return (
    <div className="flex h-full min-h-0 flex-col">
      <UiAppSidebar
        className="min-h-0 flex-1"
        hideFooter
        hideNotifications
        brand={
          showTeamSwitcher
            ? undefined
            : {
                logo: <AdminBrandLogo />,
                title: adminBrand.consoleTitle,
                subtitle: brandSubtitle,
              }
        }
        teams={showTeamSwitcher ? teamSwitcherTeams : undefined}
        activeTeamId={activeTeamId}
        onTeamChange={(tenantId) => void onTeamChange(tenantId)}
        navMapSections={navMapSections}
        onNavSelect={handleNavSelect}
      />
      <AdminProductSelector />
    </div>
  )
}
