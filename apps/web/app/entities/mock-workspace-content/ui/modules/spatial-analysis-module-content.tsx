import { Badge, Button, cn } from '@repo/ui'
import {
  BarChart3Icon,
  CircleDotIcon,
  LayersIcon,
  PlayIcon,
  RulerIcon,
  SquareStackIcon,
} from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const ANALYSIS_TOOLS = [
  {
    id: 'buffer',
    label: '缓冲区分析',
    description: '按距离生成要素周边缓冲带',
    icon: CircleDotIcon,
  },
  {
    id: 'overlay',
    label: '叠加分析',
    description: '多图层相交、合并与裁剪',
    icon: LayersIcon,
  },
  {
    id: 'measure-area',
    label: '测面统计',
    description: '绘制范围并汇总面积与数量',
    icon: RulerIcon,
  },
  {
    id: 'cluster',
    label: '聚类热力',
    description: '点位密度与热点区域识别',
    icon: BarChart3Icon,
  },
] as const

const RECENT_JOBS = [
  { id: 'j1', name: '西湖景区 500m 缓冲', status: '已完成', duration: '2.1s' },
  { id: 'j2', name: '巡检航线 × 禁飞区', status: '运行中', duration: '—' },
] as const

export function SpatialAnalysisModuleContent(_props: MockModuleContentProps) {
  const [activeToolId, setActiveToolId] = useState<string>('buffer')

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="分析工具">
        <ul className="space-y-2">
          {ANALYSIS_TOOLS.map((tool) => {
            const Icon = tool.icon
            const active = activeToolId === tool.id
            return (
              <li key={tool.id}>
                <button
                  type="button"
                  onClick={() => setActiveToolId(tool.id)}
                  className={cn(
                    'border-border hover:border-primary/30 flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'bg-background/60 dark:bg-black/20',
                  )}
                >
                  <div
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-md',
                      active ? 'bg-primary/15 text-primary' : 'bg-muted/50 text-muted-foreground',
                    )}
                  >
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">{tool.label}</p>
                    <p className="text-muted-foreground text-xs">{tool.description}</p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
        <Button type="button" size="sm" className="mt-3 w-full gap-1.5">
          <PlayIcon className="size-3.5" aria-hidden />
          开始分析
        </Button>
      </MockContentSection>

      <MockContentSection title="最近任务">
        <ul className="space-y-2">
          {RECENT_JOBS.map((job) => (
            <li
              key={job.id}
              className="border-border flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 dark:bg-black/15"
            >
              <SquareStackIcon className="text-muted-foreground size-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm">{job.name}</p>
                <p className="text-muted-foreground text-[10px]">耗时 {job.duration}</p>
              </div>
              <Badge
                variant={job.status === '运行中' ? 'default' : 'secondary'}
                className="shrink-0 text-[10px]"
              >
                {job.status}
              </Badge>
            </li>
          ))}
        </ul>
      </MockContentSection>
    </div>
  )
}
