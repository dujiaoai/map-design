import type { ComponentProps } from 'react'
import { useMemo } from 'react'

import { AppSidebar as UiAppSidebar } from '@repo/ui'
import { useNavigate } from 'react-router'

import {
  buildNavMapSections,
  useWorkspaceNavMainItems,
  useWorkspaceNavSectionDefs,
} from '~/entities/navigation'
import {
  createNavSelectHandler,
  useActiveNavItemIds,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import { TenantLogo, useEnabledTenantFeatures, useTeamSwitcher } from '~/features/team-switcher'

export function AppSidebar(props: ComponentProps<typeof UiAppSidebar>) {
  const navigate = useNavigate()
  const activeNavItemIds = useActiveNavItemIds()
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)

  const enabledTenantFeatures = useEnabledTenantFeatures()
  const tenantNavItems = useWorkspaceNavMainItems()
  const navSectionDefs = useWorkspaceNavSectionDefs()

  const navMapSections = useMemo(
    () => buildNavMapSections(navSectionDefs, activeNavItemIds, enabledTenantFeatures),
    [activeNavItemIds, enabledTenantFeatures, navSectionDefs],
  )

  const handleNavSelect = useMemo(
    () =>
      createNavSelectHandler({
        items: tenantNavItems,
        navigate,
        togglePanelTool,
        toggleMapTool,
        toggleMapModule,
        toggleMapDockModule,
      }),
    [navigate, tenantNavItems, toggleMapDockModule, toggleMapModule, toggleMapTool, togglePanelTool],
  )

  const { teams, activeTeamId, onTeamChange, showTeamSwitcher } = useTeamSwitcher()

  return (
    <UiAppSidebar
      hideFooter
      brand={
        showTeamSwitcher
          ? undefined
          : {
              logo: <TenantLogo />,
              title: '云眼综合服务平台',
            }
      }
      teams={showTeamSwitcher ? teams : undefined}
      activeTeamId={activeTeamId}
      onTeamChange={onTeamChange}
      navMapSections={navMapSections}
      onNavSelect={handleNavSelect}
      {...props}
    />
  )
}
