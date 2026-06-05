import {
  cn,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@repo/ui'
import { ChevronDownIcon, ChevronUpIcon, RotateCcwIcon, Settings2Icon } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router'

import { mockNavMainItems } from '~/entities/navigation'
import {
  createNavSelectHandler,
  useActiveNavItemIds,
  useMapWorkspaceStore,
} from '~/features/map-workspace'
import {
  resolveQuickToolDef,
  useQuickToolbarPrefs,
} from '~/features/map-quick-toolbar'

/**
 * 地图画布快捷工具条（主流 GIS：常用工具贴近地图，而非深埋侧栏）
 */
export function MapQuickToolbar({ className }: { className?: string }) {
  const navigate = useNavigate()
  const activeNavItemIds = useActiveNavItemIds()
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)
  const { selectedIds, catalog, toggleTool, moveTool, restoreDefaults, maxTools, minTools } =
    useQuickToolbarPrefs()

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

  const visibleTools = selectedIds
    .map((navItemId) => resolveQuickToolDef(navItemId))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  return (
    <div
      className={cn(
        'workspace-map-toolbar cc-glass-panel pointer-events-auto absolute top-3 left-3 z-20',
        'flex flex-col gap-0.5 rounded-lg p-1',
        className,
      )}
      role="toolbar"
      aria-label="地图快捷工具"
    >
      {visibleTools.map(({ navItemId, label, icon: Icon }) => {
        const active = activeNavItemIds.includes(navItemId)

        return (
          <Tooltip key={navItemId}>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label={label}
                  aria-pressed={active}
                  className={cn(
                    'flex size-9 items-center justify-center rounded-md transition-colors',
                    active
                      ? 'bg-primary/20 text-brand-deep shadow-[0_0_12px_rgba(48,148,255,0.18)] dark:text-brand-light dark:shadow-[0_0_16px_rgba(48,148,255,0.25)]'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white/90',
                  )}
                  onClick={() => handleNavSelect(navItemId)}
                >
                  <Icon className="size-4" />
                </button>
              }
            />
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        )
      })}

      <div className="bg-border my-0.5 h-px dark:bg-white/8" aria-hidden />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="自定义快捷工具"
              title="自定义快捷工具"
              className="text-muted-foreground flex size-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/80"
            />
          }
        >
          <Settings2Icon className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" className="w-56">
          <DropdownMenuLabel className="text-xs">
            快捷工具（{selectedIds.length}/{maxTools}）
          </DropdownMenuLabel>
          {catalog.map((tool) => {
            const checked = selectedIds.includes(tool.navItemId)
            const selectedIndex = selectedIds.indexOf(tool.navItemId)
            const disableUncheck = checked && selectedIds.length <= minTools
            const disableCheck = !checked && selectedIds.length >= maxTools

            return (
              <div key={tool.navItemId} className="flex items-center gap-0.5 pr-1">
                <DropdownMenuCheckboxItem
                  checked={checked}
                  disabled={disableUncheck || disableCheck}
                  className="min-w-0 flex-1"
                  onCheckedChange={(value) => toggleTool(tool.navItemId, value === true)}
                >
                  {tool.label}
                </DropdownMenuCheckboxItem>
                {checked ? (
                  <div className="flex shrink-0 flex-col">
                    <button
                      type="button"
                      aria-label={`上移${tool.label}`}
                      disabled={selectedIndex <= 0}
                      className="text-muted-foreground hover:text-foreground rounded p-0.5 disabled:opacity-30"
                      onClick={() => moveTool(tool.navItemId, 'up')}
                    >
                      <ChevronUpIcon className="size-3" />
                    </button>
                    <button
                      type="button"
                      aria-label={`下移${tool.label}`}
                      disabled={selectedIndex === selectedIds.length - 1}
                      className="text-muted-foreground hover:text-foreground rounded p-0.5 disabled:opacity-30"
                      onClick={() => moveTool(tool.navItemId, 'down')}
                    >
                      <ChevronDownIcon className="size-3" />
                    </button>
                  </div>
                ) : null}
              </div>
            )
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={restoreDefaults}>
            <RotateCcwIcon />
            恢复默认
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
