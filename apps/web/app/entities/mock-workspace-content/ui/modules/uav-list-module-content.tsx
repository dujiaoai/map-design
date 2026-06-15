import { Badge, Button, cn } from '@repo/ui'
import { BatteryMediumIcon, RadioIcon, WarehouseIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_DOCKS = [
  {
    id: 'd1',
    name: '机库-HZ-01',
    location: '西湖区 · 龙井路',
    drones: 2,
    status: 'online',
    battery: 86,
  },
  {
    id: 'd2',
    name: '机库-HZ-03',
    location: '滨江区 · 网商路',
    drones: 1,
    status: 'online',
    battery: 62,
  },
  {
    id: 'd3',
    name: '机库-HZ-05',
    location: '萧山区 · 机场大道',
    drones: 3,
    status: 'offline',
    battery: 0,
  },
] as const

export function UavListModuleContent(_props: MockModuleContentProps) {
  const [activeId, setActiveId] = useState<string>('d1')

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="机库列表">
        <ul className="space-y-2">
          {MOCK_DOCKS.map((dock) => {
            const active = activeId === dock.id
            return (
              <li key={dock.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(dock.id)}
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
                    <p className="text-muted-foreground truncate text-xs">{dock.location}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant={dock.status === 'online' ? 'secondary' : 'outline'}
                        className="text-[10px]"
                      >
                        {dock.status === 'online' ? '在线' : '离线'}
                      </Badge>
                      <span className="text-muted-foreground text-[10px]">
                        {dock.drones} 架无人机
                      </span>
                      {dock.status === 'online' ? (
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                          <BatteryMediumIcon className="size-3" aria-hidden />
                          {dock.battery}%
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        <Button type="button" size="sm" variant="outline" className="mt-3 w-full gap-1.5">
          <RadioIcon className="size-3.5" aria-hidden />
          在地图上显示机库
        </Button>
      </MockContentSection>
    </div>
  )
}
