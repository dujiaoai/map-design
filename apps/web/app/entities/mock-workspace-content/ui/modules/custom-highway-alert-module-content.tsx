import { Badge, cn } from '@repo/ui'
import { CarIcon, GaugeIcon, RouteIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_ALERTS = [
  {
    id: 'h1',
    highway: 'G25 长深高速',
    section: 'K1820+300',
    speed: '132 km/h',
    limit: '120 km/h',
    status: '待处置',
    time: '08:42',
  },
  {
    id: 'h2',
    highway: 'S13 练杭高速',
    section: 'K45+120',
    speed: '118 km/h',
    limit: '100 km/h',
    status: '已推送',
    time: '08:15',
  },
  {
    id: 'h3',
    highway: 'G60 沪昆高速',
    section: 'K198+800',
    speed: '145 km/h',
    limit: '120 km/h',
    status: '待处置',
    time: '07:58',
  },
] as const

export function CustomHighwayAlertModuleContent(_props: MockModuleContentProps) {
  const [activeId, setActiveId] = useState<string>('h1')

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="高速预警">
        <ul className="space-y-2">
          {MOCK_ALERTS.map((alert) => {
            const active = activeId === alert.id
            return (
              <li key={alert.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(alert.id)}
                  className={cn(
                    'border-border flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'bg-background/60 hover:border-primary/30 dark:bg-black/20',
                  )}
                >
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                    <CarIcon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">{alert.highway}</p>
                    <p className="text-muted-foreground text-xs">{alert.section}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant="destructive" className="gap-0.5 text-[10px]">
                        <GaugeIcon className="size-3" aria-hidden />
                        {alert.speed}
                      </Badge>
                      <span className="text-muted-foreground text-[10px]">限速 {alert.limit}</span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge
                      variant={alert.status === '待处置' ? 'default' : 'secondary'}
                      className="text-[10px]"
                    >
                      {alert.status}
                    </Badge>
                    <span className="text-muted-foreground text-[10px]">{alert.time}</span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </MockContentSection>
      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <RouteIcon className="size-3.5" aria-hidden />
        租户功能 custom.highway-alert · 演示 mock
      </p>
    </div>
  )
}
