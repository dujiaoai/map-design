import { mockDockModuleMeta, mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'

export function useContextPanelSurface() {
  const activeModuleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const modulePanelCollapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const modulePanelFullscreen = useMapWorkspaceStore((state) => state.modulePanelFullscreen)
  const toggleModulePanelFullscreen = useMapWorkspaceStore(
    (state) => state.toggleModulePanelFullscreen,
  )
  const closeMapModule = useMapWorkspaceStore((state) => state.closeMapModule)

  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const dockPanelCollapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const dockPanelFullscreen = useMapWorkspaceStore((state) => state.dockPanelFullscreen)
  const toggleDockPanelFullscreen = useMapWorkspaceStore(
    (state) => state.toggleDockPanelFullscreen,
  )
  const closeMapDockModule = useMapWorkspaceStore((state) => state.closeMapDockModule)

  if (activeDockModuleId && !dockPanelCollapsed) {
    const title = mockDockModuleMeta[activeDockModuleId]?.title ?? activeDockModuleId
    return {
      title,
      fullscreen: dockPanelFullscreen,
      toggleFullscreen: toggleDockPanelFullscreen,
      closeModule: closeMapDockModule,
    }
  }

  if (activeModuleId && !modulePanelCollapsed) {
    const title = mockModuleMeta[activeModuleId]?.title ?? activeModuleId
    return {
      title,
      fullscreen: modulePanelFullscreen,
      toggleFullscreen: toggleModulePanelFullscreen,
      closeModule: closeMapModule,
    }
  }

  return null
}
