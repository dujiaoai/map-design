import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  cn,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui'
import {
  GripVerticalIcon,
  Minimize2Icon,
  MapPinIcon,
  PanelLeftIcon,
  PanelTopIcon,
  RotateCcwIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react'
import { useMemo } from 'react'

import {
  canReorderQuickTools,
  groupQuickToolCatalog,
  groupSelectedQuickTools,
  orderQuickToolbarIds,
  resolveQuickToolDef,
  type QuickToolDef,
  type QuickToolbarLayout,
} from '~/features/map-quick-toolbar'
import { WORKSPACE_CHROME_ICON_TONE_CLASS } from '~/shared/lib/workspace-chrome-styles'

const MENU_SORTABLE_PREFIX = 'quick-toolbar-menu:'

function toMenuSortableId(navItemId: string) {
  return `${MENU_SORTABLE_PREFIX}${navItemId}`
}

function fromMenuSortableId(id: string) {
  return id.startsWith(MENU_SORTABLE_PREFIX) ? id.slice(MENU_SORTABLE_PREFIX.length) : id
}

function QuickToolbarSelectedRow({
  navItemId,
  disabled,
  disableRemove,
  onRemove,
}: {
  navItemId: string
  disabled: boolean
  disableRemove: boolean
  onRemove: () => void
}) {
  const tool = resolveQuickToolDef(navItemId)
  if (!tool) {
    return null
  }

  const Icon = tool.icon
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: toMenuSortableId(navItemId),
    disabled,
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'workspace-quick-toolbar-selected-row flex items-center gap-1 rounded-md px-1 py-0.5',
        isDragging && 'workspace-quick-toolbar-selected-row--dragging bg-accent/60',
      )}
    >
      <button
        type="button"
        aria-label={`拖动${tool.label}`}
        className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 cursor-grab items-center justify-center rounded touch-none active:cursor-grabbing"
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>
      <Icon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
      <span className="min-w-0 flex-1 truncate text-xs">{tool.label}</span>
      <button
        type="button"
        aria-label={`移除${tool.label}`}
        title={disableRemove ? `至少保留 1 个工具` : `移除${tool.label}`}
        disabled={disableRemove}
        className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 items-center justify-center rounded disabled:opacity-30"
        onClick={onRemove}
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

export function QuickToolbarCustomizeMenu({
  gearRef,
  menuOpen,
  onMenuOpenChange,
  menuAlignOffset,
  layout,
  onLayoutChange,
  selectedIds,
  catalog,
  toggleTool,
  reorderTools,
  restoreDefaults,
  onResetToolbarPosition,
  onCollapseToolbar,
  minTools,
}: {
  gearRef: React.RefObject<HTMLButtonElement | null>
  menuOpen: boolean
  onMenuOpenChange: (open: boolean) => void
  menuAlignOffset: number
  layout: QuickToolbarLayout
  onLayoutChange: (layout: QuickToolbarLayout) => void
  selectedIds: string[]
  catalog: QuickToolDef[]
  toggleTool: (navItemId: string, enabled: boolean) => void
  reorderTools: (activeId: string, overId: string) => void
  restoreDefaults: () => void
  onResetToolbarPosition: () => void
  onCollapseToolbar: () => void
  minTools: number
}) {
  const menuSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  )

  const groupedCatalog = useMemo(() => groupQuickToolCatalog(catalog), [catalog])
  const groupedSelected = useMemo(() => groupSelectedQuickTools(selectedIds), [selectedIds])
  const orderedSelectedIds = useMemo(() => orderQuickToolbarIds(selectedIds), [selectedIds])
  const menuSortableIds = orderedSelectedIds.map(toMenuSortableId)

  function handleMenuDragEnd(event: DragEndEvent) {
    const activeId = fromMenuSortableId(String(event.active.id))
    const overId = event.over ? fromMenuSortableId(String(event.over.id)) : null
    if (!overId || activeId === overId || !canReorderQuickTools(activeId, overId)) {
      return
    }
    reorderTools(activeId, overId)
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={onMenuOpenChange}>
      <DropdownMenuTrigger
        render={
          <button
            ref={gearRef}
            type="button"
            aria-label="自定义快捷工具"
            aria-expanded={menuOpen}
            title="自定义快捷工具"
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-md transition-colors',
              WORKSPACE_CHROME_ICON_TONE_CLASS,
              menuOpen && 'bg-accent text-foreground dark:bg-white/8 dark:text-white/80',
            )}
          />
        }
      >
        <Settings2Icon className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="bottom"
        align="start"
        alignOffset={menuAlignOffset}
        sideOffset={6}
        className="cc-menu-popover workspace-quick-toolbar-menu origin-top-left flex max-h-[min(calc(100vh-4rem),28rem)] flex-col overflow-hidden p-0 data-open:animate-none data-closed:animate-none"
      >
        <div className="border-border shrink-0 border-b px-2 py-2 dark:border-white/8">
          <p className="text-foreground text-sm font-medium">自定义快捷工具</p>
          <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
            已选 {selectedIds.length} 个 · 按分类展示，同类内可拖动排序
          </p>
        </div>

        <div className="workspace-quick-toolbar-menu-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain py-1">
          <p className="text-muted-foreground px-2 py-1.5 text-[10px] font-medium tracking-wide uppercase">
            已选工具
          </p>
          <DndContext sensors={menuSensors} onDragEnd={handleMenuDragEnd}>
            <SortableContext items={menuSortableIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-1 px-1 pb-1">
                {groupedSelected.map((section) => (
                  <div key={section.group}>
                    <p className="text-muted-foreground px-2 py-1 text-[10px] font-medium tracking-wide uppercase">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map(({ navItemId }) => (
                        <QuickToolbarSelectedRow
                          key={navItemId}
                          navItemId={navItemId}
                          disabled={false}
                          disableRemove={selectedIds.length <= minTools}
                          onRemove={() => toggleTool(navItemId, false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <DropdownMenuSeparator className="my-1" />

          <p className="text-muted-foreground px-2 py-1.5 text-[10px] font-medium tracking-wide uppercase">
            添加工具
          </p>

          {groupedCatalog.map(({ group, label, items }) => {
            const visibleItems = items.filter((tool) => !selectedIds.includes(tool.navItemId))

            if (visibleItems.length === 0) {
              return null
            }

            return (
              <DropdownMenuGroup key={group} className="pb-1">
                <DropdownMenuLabel className="text-muted-foreground px-2 text-[10px] tracking-wide uppercase">
                  {label}
                </DropdownMenuLabel>
                {visibleItems.map((tool) => {
                  const Icon = tool.icon

                  return (
                    <DropdownMenuCheckboxItem
                      key={tool.navItemId}
                      checked={false}
                      className="min-w-0 gap-2"
                      onCheckedChange={(value) => {
                        if (value === true) {
                          toggleTool(tool.navItemId, true)
                        }
                      }}
                    >
                      <Icon className="size-3.5 shrink-0 opacity-70" aria-hidden />
                      <span className="truncate">{tool.label}</span>
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuGroup>
            )
          })}
        </div>

        <div className="border-border shrink-0 border-t dark:border-white/8">
          <p className="text-muted-foreground px-2 pt-2 pb-1 text-[10px] font-medium tracking-wide uppercase">
            显示方向
          </p>
          <DropdownMenuRadioGroup
            value={layout}
            onValueChange={(value) => {
              if (value === 'horizontal' || value === 'vertical') {
                onLayoutChange(value)
              }
            }}
          >
            <DropdownMenuRadioItem value="horizontal" className="gap-2">
              <PanelTopIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              横向排列
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="vertical" className="gap-2">
              <PanelLeftIcon className="size-3.5 shrink-0 opacity-70" aria-hidden />
              纵向排列
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator className="my-1" />
          <DropdownMenuItem onClick={onCollapseToolbar}>
            <Minimize2Icon />
            收起为浮标
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onResetToolbarPosition}>
            <MapPinIcon />
            重置工具条位置
          </DropdownMenuItem>
          <DropdownMenuItem onClick={restoreDefaults}>
            <RotateCcwIcon />
            恢复默认工具
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
