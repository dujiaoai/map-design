import { DndContext, useDraggable } from '@dnd-kit/core'
import {
  horizontalListSortingStrategy,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button, cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'
import { GripVerticalIcon, Minimize2Icon, WrenchIcon, XIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { mockNavMainItems } from '~/entities/navigation'
import { createNavSelectHandler, useActiveNavItemIds, useMapWorkspaceStore } from '~/features/map-workspace'
import {
  canReorderQuickTools,
  DEFAULT_QUICK_TOOLBAR_POSITION,
  groupSelectedQuickTools,
  hasSeenQuickToolbarOnboarding,
  loadQuickToolbarPosition,
  markQuickToolbarOnboardingSeen,
  orderQuickToolbarIds,
  resetQuickToolbarPosition,
  saveQuickToolbarPosition,
  useQuickToolbarPrefs,
} from '~/features/map-quick-toolbar'
import {
  EDGE_MARGIN,
  QUICK_TOOLBAR_DRAG_ID,
  useWorkspaceSurfaceDnd,
  WorkspaceSnapGuides,
} from '~/features/workspace-surface-drag'

import { QuickToolbarCustomizeMenu } from './quick-toolbar-customize-menu'
import { QuickToolbarSortableTool } from './quick-toolbar-sortable-tool'

/**
 * 地图画布快捷工具条（@dnd-kit：拖动手柄定位 + sortable 排序 + 对齐吸附）
 */
export function MapQuickToolbar({ className }: { className?: string }) {
  const { selectedIds, collapsed, setCollapsed, layout, setLayout, catalog, toggleTool, reorderTools, restoreDefaults, minTools } =
    useQuickToolbarPrefs()

  const containerRef = useRef<HTMLElement | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [toolbarReadySignal, setToolbarReadySignal] = useState(0)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const layoutKey = `${collapsed ? 'collapsed' : 'expanded'}|${layout}|${selectedIds.join('|')}|${canvasWidth}`

  const surface = useWorkspaceSurfaceDnd({
    dragId: QUICK_TOOLBAR_DRAG_ID,
    containerRef,
    elementRef: toolbarRef,
    layoutKey,
    readySignal: toolbarReadySignal,
    initialPosition: loadQuickToolbarPosition() ?? DEFAULT_QUICK_TOOLBAR_POSITION,
    layoutResetPosition: DEFAULT_QUICK_TOOLBAR_POSITION,
    needsLayout: () => false,
    resolveDefault: () => DEFAULT_QUICK_TOOLBAR_POSITION,
    onPersist: saveQuickToolbarPosition,
    onPersistReset: resetQuickToolbarPosition,
    enableKeyboardSensor: true,
    onDragEnd: (event) => {
      const activeId = String(event.active.id)
      const overId = event.over ? String(event.over.id) : null
      if (
        activeId !== QUICK_TOOLBAR_DRAG_ID &&
        overId &&
        activeId !== overId &&
        canReorderQuickTools(activeId, overId)
      ) {
        reorderTools(activeId, overId)
      }
    },
  })

  useEffect(() => {
    if (!hasSeenQuickToolbarOnboarding()) {
      setShowOnboarding(true)
    }
  }, [])

  function handleResetToolbarPosition() {
    surface.resetPosition()
    setToolbarReadySignal((value) => value + 1)
  }

  function handleCollapse(nextCollapsed: boolean) {
    setCollapsed(nextCollapsed)
    setToolbarReadySignal((value) => value + 1)
  }

  function handleLayoutChange(nextLayout: typeof layout) {
    setLayout(nextLayout)
    setToolbarReadySignal((value) => value + 1)
  }

  return (
    <DndContext
      sensors={surface.sensors}
      modifiers={[...surface.modifiers]}
      onDragStart={surface.onDragStart}
      onDragMove={surface.onDragMove}
      onDragEnd={surface.onDragEnd}
      onDragCancel={surface.onDragCancel}
    >
      <MapQuickToolbarDraggable
        className={className}
        containerRef={containerRef}
        toolbarRef={toolbarRef}
        position={surface.position}
        isDragging={surface.isDragging}
        containerWidth={surface.containerWidth}
        activeSnapX={surface.activeSnapX}
        activeSnapY={surface.activeSnapY}
        onToolbarReady={() => setToolbarReadySignal((value) => value + 1)}
        onToolbarLayoutChange={() => setToolbarReadySignal((value) => value + 1)}
        onCanvasWidthChange={setCanvasWidth}
        canvasWidth={canvasWidth}
        collapsed={collapsed}
        onCollapse={handleCollapse}
        layout={layout}
        onLayoutChange={handleLayoutChange}
        selectedIds={selectedIds}
        catalog={catalog}
        toggleTool={toggleTool}
        reorderTools={reorderTools}
        restoreDefaults={restoreDefaults}
        onResetToolbarPosition={handleResetToolbarPosition}
        minTools={minTools}
        showOnboarding={showOnboarding}
        onDismissOnboarding={() => {
          markQuickToolbarOnboardingSeen()
          setShowOnboarding(false)
        }}
      />
    </DndContext>
  )
}

function MapQuickToolbarDraggable({
  className,
  containerRef,
  toolbarRef,
  position,
  isDragging,
  containerWidth,
  activeSnapX,
  activeSnapY,
  onToolbarReady,
  onToolbarLayoutChange,
  onCanvasWidthChange,
  canvasWidth,
  collapsed,
  onCollapse,
  layout,
  onLayoutChange,
  selectedIds,
  catalog,
  toggleTool,
  reorderTools,
  restoreDefaults,
  onResetToolbarPosition,
  minTools,
  showOnboarding,
  onDismissOnboarding,
}: {
  className?: string
  containerRef: React.RefObject<HTMLElement | null>
  toolbarRef: React.RefObject<HTMLDivElement | null>
  position: { x: number; y: number }
  isDragging: boolean
  containerWidth: number
  activeSnapX: ReturnType<typeof useWorkspaceSurfaceDnd>['activeSnapX']
  activeSnapY: ReturnType<typeof useWorkspaceSurfaceDnd>['activeSnapY']
  onToolbarReady: () => void
  onToolbarLayoutChange: () => void
  onCanvasWidthChange: (width: number) => void
  canvasWidth: number
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  layout: 'horizontal' | 'vertical'
  onLayoutChange: (layout: 'horizontal' | 'vertical') => void
  selectedIds: string[]
  catalog: ReturnType<typeof useQuickToolbarPrefs>['catalog']
  toggleTool: ReturnType<typeof useQuickToolbarPrefs>['toggleTool']
  reorderTools: ReturnType<typeof useQuickToolbarPrefs>['reorderTools']
  restoreDefaults: ReturnType<typeof useQuickToolbarPrefs>['restoreDefaults']
  onResetToolbarPosition: () => void
  minTools: number
  showOnboarding: boolean
  onDismissOnboarding: () => void
}) {
  const navigate = useNavigate()
  const activeNavItemIds = useActiveNavItemIds()
  const togglePanelTool = useMapWorkspaceStore((state) => state.togglePanelTool)
  const toggleMapTool = useMapWorkspaceStore((state) => state.toggleMapTool)
  const toggleMapModule = useMapWorkspaceStore((state) => state.toggleMapModule)
  const toggleMapDockModule = useMapWorkspaceStore((state) => state.toggleMapDockModule)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuAlignOffset, setMenuAlignOffset] = useState(0)
  const gearRef = useRef<HTMLButtonElement>(null)
  const hasReportedReadyRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    function syncCanvasWidth() {
      onCanvasWidthChange(container!.clientWidth)
    }

    syncCanvasWidth()
    const observer = new ResizeObserver(syncCanvasWidth)
    observer.observe(container)
    return () => observer.disconnect()
  }, [collapsed, containerRef, onCanvasWidthChange, selectedIds.length])

  useEffect(() => {
    const toolbar = toolbarRef.current
    if (!toolbar || collapsed) {
      return
    }

    const observer = new ResizeObserver(() => {
      onToolbarLayoutChange()
    })
    observer.observe(toolbar)
    return () => observer.disconnect()
  }, [canvasWidth, collapsed, layout, onToolbarLayoutChange, position.x, selectedIds.length, toolbarRef])

  const toolbarMaxWidth =
    canvasWidth > 0
      ? Math.max(120, canvasWidth - Math.max(EDGE_MARGIN, position.x) - EDGE_MARGIN)
      : undefined

  const {
    attributes: toolbarAttributes,
    listeners: toolbarListeners,
    setNodeRef: setToolbarNodeRef,
    transform: toolbarTransform,
    isDragging: isToolbarNodeDragging,
  } = useDraggable({
    id: QUICK_TOOLBAR_DRAG_ID,
  })

  const mergeToolbarRef = useCallback(
    (node: HTMLDivElement | null) => {
      setToolbarNodeRef(node)
      toolbarRef.current = node
      containerRef.current = node?.closest('.workspace-canvas') ?? null
      if (node && !hasReportedReadyRef.current) {
        hasReportedReadyRef.current = true
        onToolbarReady()
      }
    },
    [containerRef, onToolbarReady, setToolbarNodeRef, toolbarRef],
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

  const groupedTools = useMemo(() => groupSelectedQuickTools(selectedIds), [selectedIds])
  const orderedSelectedIds = useMemo(() => orderQuickToolbarIds(selectedIds), [selectedIds])
  const activeQuickToolCount = useMemo(
    () => activeNavItemIds.filter((id) => selectedIds.includes(id)).length,
    [activeNavItemIds, selectedIds],
  )

  function syncMenuAlignOffset() {
    const toolbar = toolbarRef.current
    const gear = gearRef.current
    if (!toolbar || !gear) {
      return
    }

    setMenuAlignOffset(toolbar.getBoundingClientRect().left - gear.getBoundingClientRect().left)
  }

  function handleMenuOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      syncMenuAlignOffset()
    }
    setMenuOpen(nextOpen)
  }

  const toolbarDragging = isDragging || isToolbarNodeDragging
  const sortableDisabled = toolbarDragging || menuOpen
  const isVertical = layout === 'vertical'
  const sortableStrategy = isVertical ? verticalListSortingStrategy : horizontalListSortingStrategy
  const tooltipSide = isVertical ? 'right' : 'bottom'

  const dragHandle = (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label="拖动快捷工具条"
            className={cn(
              'text-muted-foreground flex size-9 shrink-0 cursor-grab items-center justify-center rounded-md touch-none select-none active:cursor-grabbing',
              'hover:bg-accent hover:text-foreground dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/80',
              toolbarDragging && 'cursor-grabbing bg-accent/80',
            )}
            {...toolbarListeners}
          >
            <GripVerticalIcon className="size-4" />
          </button>
        }
      />
      <TooltipContent side={tooltipSide}>拖动工具条（靠近边缘/中线自动对齐）</TooltipContent>
    </Tooltip>
  )

  return (
    <>
      {toolbarDragging && containerWidth > 0 ? (
        <WorkspaceSnapGuides
          containerWidth={containerWidth}
          activeSnapX={activeSnapX}
          activeSnapY={activeSnapY}
        />
      ) : null}

      <div
        ref={mergeToolbarRef}
        className={cn(
          'workspace-map-toolbar cc-glass-panel pointer-events-auto absolute z-20 touch-none',
          collapsed
            ? 'workspace-map-toolbar--collapsed flex items-center gap-0.5 rounded-full p-1'
            : cn(
                'workspace-map-toolbar--expanded rounded-lg p-1',
                isVertical
                  ? 'workspace-map-toolbar--vertical flex flex-col items-stretch gap-y-0.5'
                  : 'workspace-map-toolbar--horizontal flex flex-wrap items-center gap-x-0.5 gap-y-1',
              ),
          toolbarDragging && 'workspace-surface-dragging workspace-map-toolbar--dragging shadow-[0_12px_40px_rgba(0,0,0,0.35)]',
          className,
        )}
        style={{
          left: Math.max(0, position.x),
          top: Math.max(0, position.y),
          maxWidth: isVertical ? undefined : toolbarMaxWidth,
          transform: toolbarTransform ? CSS.Translate.toString(toolbarTransform) : undefined,
        }}
        {...toolbarAttributes}
        role="toolbar"
        aria-label={collapsed ? '快捷工具浮标' : '地图快捷工具'}
      >
        {collapsed ? (
          <>
            {dragHandle}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    aria-label={`展开快捷工具（${selectedIds.length} 项）`}
                    className={cn(
                      'relative flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
                      'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white/90',
                      activeQuickToolCount > 0 &&
                        'text-brand-deep dark:text-brand-light shadow-[0_0_12px_var(--brand-glow)]',
                    )}
                    onClick={() => onCollapse(false)}
                  >
                    <WrenchIcon className="size-4" />
                    <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-4 font-medium tabular-nums">
                      {selectedIds.length}
                    </span>
                    {activeQuickToolCount > 0 ? (
                      <span
                        className="bg-brand-light absolute right-0 bottom-0 size-2 rounded-full ring-2 ring-background dark:ring-surface-panel"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                }
              />
              <TooltipContent side="bottom">展开快捷工具</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <>
            {dragHandle}

        <SortableContext items={orderedSelectedIds} strategy={sortableStrategy}>
          {groupedTools.map((section, sectionIndex) => (
            <div
              key={section.group}
              className={cn(
                isVertical ? 'flex flex-col items-stretch gap-0.5' : 'flex flex-wrap items-center gap-0.5',
                sectionIndex > 0 &&
                  (isVertical
                    ? 'workspace-map-toolbar-group border-border mt-0.5 border-t pt-0.5 dark:border-white/8'
                    : 'workspace-map-toolbar-group border-border ml-0.5 border-l pl-0.5 dark:border-white/8'),
              )}
            >
              {section.items.map(({ navItemId, label, icon }) => (
                <QuickToolbarSortableTool
                  key={navItemId}
                  navItemId={navItemId}
                  label={label}
                  icon={icon}
                  active={activeNavItemIds.includes(navItemId)}
                  disabled={sortableDisabled}
                  tooltipSide={tooltipSide}
                  onSelect={() => handleNavSelect(navItemId)}
                />
              ))}
            </div>
          ))}
        </SortableContext>

        <div
          className={cn(
            'workspace-map-toolbar-actions border-border flex shrink-0 gap-0.5 dark:border-white/8',
            isVertical
              ? 'mt-0.5 flex-col items-stretch border-t pt-0.5'
              : 'ml-0.5 items-center border-l pl-0.5',
          )}
        >

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                aria-label="收起为浮标"
                title="收起为浮标"
                className={cn(
                  'text-muted-foreground flex size-9 shrink-0 items-center justify-center rounded-md transition-colors',
                  'hover:bg-accent hover:text-foreground dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/80',
                )}
                onClick={() => onCollapse(true)}
              >
                <Minimize2Icon className="size-4" />
              </button>
            }
          />
          <TooltipContent side={tooltipSide}>收起为浮标</TooltipContent>
        </Tooltip>

        <div className="relative shrink-0">
          <QuickToolbarCustomizeMenu
            gearRef={gearRef}
            menuOpen={menuOpen}
            onMenuOpenChange={handleMenuOpenChange}
            menuAlignOffset={menuAlignOffset}
            layout={layout}
            onLayoutChange={onLayoutChange}
            selectedIds={selectedIds}
            catalog={catalog}
            toggleTool={toggleTool}
            reorderTools={reorderTools}
            restoreDefaults={restoreDefaults}
            onResetToolbarPosition={onResetToolbarPosition}
            onCollapseToolbar={() => onCollapse(true)}
            minTools={minTools}
          />

          {showOnboarding ? (
            <div className="workspace-toolbar-onboarding pointer-events-auto absolute top-full left-0 z-30 mt-2 w-56 rounded-lg border border-border bg-background/95 p-3 text-left shadow-lg backdrop-blur-md dark:border-white/12 dark:bg-surface-panel/95">
              <p className="text-foreground mb-1 text-xs font-medium">自定义快捷工具</p>
              <p className="text-muted-foreground mb-2 text-[11px] leading-relaxed">
                点击齿轮选择常用工具；可收起为浮标少占地图，⌘K 仍可打开命令面板。
              </p>
              <Button type="button" size="sm" className="h-7 w-full text-xs" onClick={onDismissOnboarding}>
                知道了
              </Button>
            </div>
          ) : null}
        </div>
        </div>

        {showOnboarding ? (
          <button
            type="button"
            aria-label="关闭引导"
            className="text-muted-foreground hover:text-foreground pointer-events-auto absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full border border-border bg-background dark:border-white/12 dark:bg-surface-panel"
            onClick={onDismissOnboarding}
          >
            <XIcon className="size-3" />
          </button>
        ) : null}
          </>
        )}
      </div>
    </>
  )
}
