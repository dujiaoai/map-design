import { Badge, Button, cn } from '@repo/ui'
import { BatteryMediumIcon, RadioIcon, WarehouseIcon } from 'lucide-react'
import { useState } from 'react'

import { useUavDocksQuery, type UavDockSummary } from '~/shared/queries/uav-dock-queries'

function CatalogSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

function DockRow({
  dock,
  active,
  onSelect,
}: {
  dock: UavDockSummary
  active: boolean
  onSelect: (id: string) => void
}) {
  const online = dock.status === 'online'

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(dock.id)}
        className={cn(
          'border-border flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
          active
            ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
            : 'bg-background/60 hover:border-primary/30 dark:bg-black/20',
        )}
      >
        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
          <WarehouseIcon className="size-4" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-medium">{dock.name}</p>
          {dock.locationLabel ? (
            <p className="text-muted-foreground truncate text-xs">{dock.locationLabel}</p>
          ) : null}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant={online ? 'secondary' : 'outline'} className="text-[10px]">
              {online ? '在线' : '离线'}
            </Badge>
            <span className="text-muted-foreground text-[10px]">{dock.droneCount} 架无人机</span>
            {online && dock.batteryPercent != null ? (
              <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                <BatteryMediumIcon className="size-3" aria-hidden />
                {dock.batteryPercent}%
              </span>
            ) : null}
          </div>
        </div>
      </button>
    </li>
  )
}

export function UavDockListPanel({ className }: { className?: string }) {
  const docksQuery = useUavDocksQuery()
  const items = docksQuery.data?.items ?? []
  const [activeId, setActiveId] = useState<string | null>(null)

  const selectedId = activeId ?? items[0]?.id ?? null

  return (
    <div className={className}>
      <CatalogSection title="机库列表">
        <div className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15">
          {docksQuery.isPending ? (
            <p className="text-muted-foreground px-2 py-3 text-xs">加载机库…</p>
          ) : docksQuery.isError ? (
            <p className="text-muted-foreground px-2 py-3 text-xs">机库加载失败</p>
          ) : items.length > 0 ? (
            <ul className="space-y-2">
              {items.map((dock) => (
                <DockRow
                  key={dock.id}
                  dock={dock}
                  active={selectedId === dock.id}
                  onSelect={setActiveId}
                />
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground px-2 py-3 text-xs">暂无机库数据</p>
          )}
        </div>
        <Button type="button" size="sm" variant="outline" className="mt-3 w-full gap-1.5" disabled>
          <RadioIcon className="size-3.5" aria-hidden />
          在地图上显示机库
        </Button>
      </CatalogSection>
    </div>
  )
}
