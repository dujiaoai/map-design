import { cn } from '@repo/ui'
import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'

import { mockNavMainItems } from '~/entities/navigation'
import { QUICK_TOOL_CATALOG } from '~/features/map-quick-toolbar'
import { createNavSelectHandler, useMapWorkspaceStore } from '~/features/map-workspace'
import {
  createWorkspaceActionExecutor,
  rememberCommandAction,
} from '~/features/workspace-command'

const CONTEXT_TOOL_IDS = [
  'tool-measure-distance',
  'tool-measure-area',
  'tool-pick-point',
  'tool-locate-point',
  'tool-import-file',
] as const

export function MapCanvasContextMenu({ className }: { className?: string }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)
  const openCommandPalette = useMapWorkspaceStore((state) => state.openCommandPalette)

  const contextTools = useMemo(
    () =>
      CONTEXT_TOOL_IDS.map((navItemId) => QUICK_TOOL_CATALOG.find((item) => item.navItemId === navItemId))
        .filter((item): item is NonNullable<typeof item> => Boolean(item)),
    [],
  )

  const executeAction = useMemo(
    () =>
      createWorkspaceActionExecutor({
        items: mockNavMainItems,
        navigate,
        getState: () => useMapWorkspaceStore.getState(),
        clearMapTool: () => useMapWorkspaceStore.getState().clearMapTool(),
        clearPanelTools: () => useMapWorkspaceStore.getState().clearPanelTools(),
        setGlobalSearchQuery: (query) => useMapWorkspaceStore.getState().setGlobalSearchQuery(query),
        openGlobalSearchDrawer: () => useMapWorkspaceStore.getState().openGlobalSearchDrawer(),
      }),
    [navigate],
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

  function runNavItem(navItemId: string) {
    rememberCommandAction({ type: 'selectNav', navItemId })
    handleNavSelect(navItemId)
    setOpen(false)
  }

  function openSearchDrawer() {
    executeAction({ type: 'openMapSearchDrawer' })
    rememberCommandAction({ type: 'openMapSearchDrawer' })
    setOpen(false)
  }

  function openPalette() {
    openCommandPalette()
    setOpen(false)
  }

  return (
    <>
      <div
        className={cn('pointer-events-auto absolute inset-0 z-[2]', className)}
        onContextMenu={(event) => {
          event.preventDefault()
          setPosition({ x: event.clientX, y: event.clientY })
          setOpen(true)
        }}
      />

      {open && typeof document !== 'undefined'
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="关闭上下文菜单"
                className="fixed inset-0 z-[130] cursor-default bg-transparent"
                onClick={() => setOpen(false)}
              />
              <div
                role="menu"
                aria-label="地图上下文菜单"
                className="cc-menu-popover fixed z-[131] min-w-48 overflow-hidden rounded-lg border p-1 shadow-xl"
                style={{ top: position.y, left: position.x }}
              >
                <p className="text-muted-foreground px-2 py-1.5 text-[10px] font-medium tracking-wide uppercase">
                  地图工具
                </p>
                {contextTools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.navItemId}
                      type="button"
                      role="menuitem"
                      className="hover:bg-accent/70 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm"
                      onClick={() => runNavItem(tool.navItemId)}
                    >
                      <Icon className="size-3.5 shrink-0 opacity-75" aria-hidden />
                      {tool.label}
                    </button>
                  )
                })}
                <div className="bg-border my-1 h-px dark:bg-white/8" />
                <button
                  type="button"
                  role="menuitem"
                  className="hover:bg-accent/70 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm"
                  onClick={openSearchDrawer}
                >
                  打开地图搜索
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="hover:bg-accent/70 flex w-full items-center rounded-md px-2 py-1.5 text-left text-sm"
                  onClick={openPalette}
                >
                  打开命令面板 ⌘K
                </button>
              </div>
            </>,
            document.body,
          )
        : null}
    </>
  )
}
