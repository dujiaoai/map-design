import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'
import type { LucideIcon } from 'lucide-react'

export function QuickToolbarSortableTool({
  navItemId,
  label,
  icon: Icon,
  active,
  disabled,
  tooltipSide = 'bottom',
  onSelect,
}: {
  navItemId: string
  label: string
  icon: LucideIcon
  active: boolean
  disabled: boolean
  tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
  onSelect: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: navItemId,
    disabled,
  })

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            ref={setNodeRef}
            type="button"
            aria-label={label}
            {...attributes}
            {...listeners}
            aria-pressed={active}
            style={{
              transform: CSS.Transform.toString(transform),
              transition,
            }}
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-md transition-colors touch-none select-none',
              isDragging && 'workspace-map-toolbar-tool--dragging z-30 cursor-grabbing opacity-90',
              !isDragging && 'cursor-grab',
              active
                ? 'bg-primary/20 text-brand-deep shadow-[0_0_12px_var(--brand-glow)] dark:text-brand-light dark:shadow-[0_0_16px_var(--brand-glow)]'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/55 dark:hover:bg-white/8 dark:hover:text-white/90',
            )}
            onClick={onSelect}
          >
            <Icon className="size-4" />
          </button>
        }
      />
      <TooltipContent side={tooltipSide}>{label}</TooltipContent>
    </Tooltip>
  )
}
