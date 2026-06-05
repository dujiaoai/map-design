import type { ComponentProps } from 'react'
import { useMemo } from 'react'

import { AppSidebar as UiAppSidebar } from '@repo/ui'
import { useNavigate } from 'react-router'

import {
  buildNavMapSections,
  mockNavMainItems,
  mockNavMapSectionDefs,
} from '~/entities/navigation'
import {
  createNavSelectHandler,
  useActiveNavItemIds,
  useMapWorkspaceStore,
} from '~/features/map-workspace'

export function AppSidebar(props: ComponentProps<typeof UiAppSidebar>) {
  const navigate = useNavigate()
  const activeNavItemIds = useActiveNavItemIds()
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)

  const navMapSections = useMemo(
    () => buildNavMapSections(mockNavMapSectionDefs, activeNavItemIds),
    [activeNavItemIds],
  )

  const handleNavSelect = useMemo(
    () =>
      createNavSelectHandler({
        items: mockNavMainItems,
        navigate,
        togglePanelTool,
        toggleMapTool,
        toggleMapModule,
        toggleMapDockModule,
      }),
    [navigate, toggleMapDockModule, toggleMapModule, toggleMapTool, togglePanelTool],
  )

  return (
    <UiAppSidebar
      hideFooter
      navMapSections={navMapSections}
      onNavSelect={handleNavSelect}
      {...props}
    />
  )
}
