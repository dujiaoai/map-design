import { Badge, Button, cn } from '@repo/ui'
import { AlertTriangleIcon, MapPinIcon, SparklesIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

type EventSeverity = 'high' | 'medium' | 'low'

interface EventRow {
  id: string
  title: string
  region: string
  time: string
  severity: EventSeverity
  aiTag: string
}

const MOCK_EVENTS: EventRow[] = [
  {
    id: 'e1',
    title: '违建疑似区域',
    region: '西湖区 · 龙井路',
    time: '10 分钟前',
    severity: 'high',
    aiTag: '变化检测',
  },
  {
    id: 'e2',
    title: '水面漂浮物',
    region: '余杭区 · 五常港',
    time: '32 分钟前',
    severity: 'medium',
    aiTag: '目标识别',
  },
  {
    id: 'e3',
    title: '施工围挡异常',
    region: '上城区 · 钱江路',
    time: '1 小时前',
    severity: 'low',
    aiTag: '场景分类',
  },
  {
    id: 'e4',
    title: '烟点疑似',
    region: '临安区 · 青山湖',
    time: '2 小时前',
    severity: 'high',
    aiTag: '烟火识别',
  },
]

const SEVERITY_LABEL: Record<EventSeverity, string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const FILTER_OPTIONS = ['全部', '高', '中', '低'] as const

export function FlightAiAlertsModuleContent(_props: MockModuleContentProps) {
  const [filter, setFilter] = useState<(typeof FILTER_OPTIONS)[number]>('全部')

  const rows = useMemo(() => {
    if (filter === '全部') return MOCK_EVENTS
    const map: Record<string, EventSeverity> = { 高: 'high', 中: 'medium', 低: 'low' }
    return MOCK_EVENTS.filter((row) => row.severity === map[filter])
  }, [filter])

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="筛选">
        <div className="flex flex-wrap gap-1.5">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                filter === option
                  ? 'border-primary/50 bg-primary/10 text-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </MockContentSection>

      <MockContentSection title="AI 事件">
        <ul className="space-y-2">
          {rows.map((event) => (
            <li
              key={event.id}
              className="border-border hover:border-primary/30 group rounded-lg border bg-background/60 p-3 transition-colors dark:bg-black/20"
            >
              <div className="flex items-start gap-2">
                <div className="bg-amber-500/15 flex size-8 shrink-0 items-center justify-center rounded-md">
                  <AlertTriangleIcon className="size-4 text-amber-600 dark:text-amber-400" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-foreground font-medium">{event.title}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {SEVERITY_LABEL[event.severity]}
                    </Badge>
                    <Badge variant="secondary" className="text-[10px]">
                      {event.aiTag}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    {event.region} · {event.time}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="button" size="sm" variant="outline" className="h-7 flex-1 text-xs">
                  <MapPinIcon className="size-3" aria-hidden />
                  定位
                </Button>
                <Button type="button" size="sm" className="h-7 flex-1 text-xs">
                  详情
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </MockContentSection>

      <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <SparklesIcon className="size-3.5" aria-hidden />
        共 {rows.length} 条 · 点击地图点位联动列表
      </p>
    </div>
  )
}
