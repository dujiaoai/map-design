import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'

import { AppSidebar as UiAppSidebar } from '@repo/ui'
import { MapIcon } from 'lucide-react'
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

function WorkspaceBrandLogo() {
  const [useFallback, setUseFallback] = useState(false)

  if (useFallback) {
    return (
      <div className="flex size-full items-center justify-center rounded-md bg-gradient-to-br from-primary to-brand-deep">
        <MapIcon className="size-4 text-primary-foreground" aria-hidden />
      </div>
    )
  }

  return (
    <img
      src="/avatars/logo.png"
      alt=""
      className="size-full object-contain"
      onError={() => setUseFallback(true)}
    />
  )
}

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
      brand={{
        logo: <WorkspaceBrandLogo />,
        title: '云眼平台',
      }}
      navMapSections={navMapSections}
      onNavSelect={handleNavSelect}
      {...props}
    />
  )
}
