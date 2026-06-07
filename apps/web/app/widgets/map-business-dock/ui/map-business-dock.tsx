import { MockModuleContent } from '~/entities/mock-workspace-content'
import { mockModuleMeta } from '~/entities/navigation'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import {
  DockPanelCollapseHandle,
  DockPanelFrame,
  DockPanelScrollBody,
} from '~/widgets/dock-panel'

/** 地图画布左侧固定业务 Dock（展开时占位列，非浮层） */
export function MapBusinessDock({
  hidden = false,
  embedded = false,
}: {
  hidden?: boolean
  /** 嵌入 MapContextPanel 时仅渲染内容，避免双层标题栏/边框 */
  embedded?: boolean
}) {
  const moduleId = useMapWorkspaceStore((state) => state.activeModuleId)
  const collapsed = useMapWorkspaceStore((state) => state.modulePanelCollapsed)
  const setCollapsed = useMapWorkspaceStore((state) => state.setModulePanelCollapsed)
  const closeModule = useMapWorkspaceStore((state) => state.closeMapModule)
  const fullscreen = useMapWorkspaceStore((state) => state.modulePanelFullscreen)
  const toggleFullscreen = useMapWorkspaceStore((state) => state.toggleModulePanelFullscreen)

  if (hidden || !moduleId || collapsed) {
    return null
  }

  const meta = mockModuleMeta[moduleId]
  if (!meta) {
    return null
  }

  if (embedded) {
    return (
      <DockPanelScrollBody>
        <MockModuleContent moduleId={moduleId} title={meta.title} />
      </DockPanelScrollBody>
    )
  }

  return (
    <DockPanelFrame
      title={meta.title}
      fullscreen={fullscreen}
      onToggleFullscreen={() => toggleFullscreen()}
      onClose={() => closeModule()}
      onExitFullscreen={() => {
        if (fullscreen) toggleFullscreen()
      }}
      footer={
        !fullscreen ? (
          <DockPanelCollapseHandle
            label={`收起${meta.title}`}
            className="-right-3.5"
            onClick={() => setCollapsed(true)}
          />
        ) : null
      }
    >
      <DockPanelScrollBody>
        <MockModuleContent moduleId={moduleId} title={meta.title} />
      </DockPanelScrollBody>
    </DockPanelFrame>
  )
}
