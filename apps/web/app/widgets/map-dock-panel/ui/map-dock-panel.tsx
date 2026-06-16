import { mockDockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelFrame,
  DockPanelScrollBody,
} from '~/widgets/dock-panel'
import { WorkspaceModuleContent } from '~/widgets/workspace-module-content'

/** 机库模块左侧固定 Dock（与非数据业务模块全局互斥） */
export function MapDockPanel({
  hidden = false,
  embedded = false,
}: {
  hidden?: boolean
  /** 嵌入 MapContextPanel 时仅渲染内容，避免双层标题栏/边框 */
  embedded?: boolean
}) {
  const activeDockModuleId = useMapWorkspaceStore((state) => state.activeDockModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.dockPanelCollapsed)
  const setDockPanelCollapsed = useMapWorkspaceStore((state) => state.setDockPanelCollapsed)
  const closeMapDockModule = useMapWorkspaceStore((state) => state.closeMapDockModule)
  const fullscreen = useMapWorkspaceStore((state) => state.dockPanelFullscreen)
  const toggleDockPanelFullscreen = useMapWorkspaceStore((state) => state.toggleDockPanelFullscreen)

  if (hidden || !activeDockModuleId || collapsed) {
    return null
  }

  const meta = mockDockModuleMeta[activeDockModuleId]
  if (!meta) {
    return null
  }

  if (embedded) {
    return (
      <DockPanelScrollBody>
        <WorkspaceModuleContent moduleId={activeDockModuleId} title={meta.title} />
      </DockPanelScrollBody>
    )
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleDockPanelFullscreen()}
      onClose={() => closeMapDockModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleDockPanelFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockPanelCollapseHandle
            label={`收起${meta.title}`}
            className="-right-3.5"
            onClick={() => setDockPanelCollapsed(true)}
          />
        ) : null
      }
    >
      <DockPanelScrollBody>
        <WorkspaceModuleContent moduleId={activeDockModuleId} title={meta.title} />
      </DockPanelScrollBody>
    </DockPanelFrame>
  )
}

