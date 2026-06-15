import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { CalendarIcon, ImageIcon, SplitSquareHorizontalIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

const PERIOD_OPTIONS = [
  { id: 'p2024', label: '2024 第三期', date: '2024-09-18', resolution: '5 cm' },
  { id: 'p2025', label: '2025 第一期', date: '2025-03-08', resolution: '5 cm' },
  { id: 'p2025b', label: '2025 第二期', date: '2025-05-22', resolution: '3 cm' },
] as const

type PeriodId = (typeof PERIOD_OPTIONS)[number]['id']

export function HdImageCompareToolContent(_props: MockToolContentProps) {
  const [mode, setMode] = useState<'swipe' | 'side'>('swipe')
  const [leftId, setLeftId] = useState<PeriodId>('p2024')
  const [rightId, setRightId] = useState<PeriodId>('p2025')

  const left = PERIOD_OPTIONS.find((item) => item.id === leftId)!
  const right = PERIOD_OPTIONS.find((item) => item.id === rightId)!

  return (
    <MockToolPanelRoot>
      <p className="text-muted-foreground text-xs leading-relaxed">
        正射影像两期对比；切换期数后地图卷帘或分屏更新。演示 mock，不加载真实瓦片。
      </p>

      <MockContentSection title="对比模式">
        <div className="flex gap-1.5">
          {(
            [
              { id: 'swipe' as const, label: '卷帘' },
              { id: 'side' as const, label: '分屏' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={mode === item.id}
              onClick={() => setMode(item.id)}
              className="border-border data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10 flex-1 rounded-md border px-2 py-1.5 text-xs transition-colors"
              data-active={mode === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
      </MockContentSection>

      <MockContentSection title="期数选择">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-muted-foreground text-[11px]">基准期</span>
            <Select value={leftId} onValueChange={(v) => setLeftId(v as PeriodId)}>
              <SelectTrigger size="sm" className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {PERIOD_OPTIONS.map((period) => (
                  <SelectItem key={period.id} value={period.id} className="text-xs">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-[11px]">对比期</span>
            <Select value={rightId} onValueChange={(v) => setRightId(v as PeriodId)}>
              <SelectTrigger size="sm" className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                {PERIOD_OPTIONS.map((period) => (
                  <SelectItem key={period.id} value={period.id} className="text-xs">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </MockContentSection>

      <MockContentSection title="影像信息">
        <div className="border-border space-y-2 rounded-md border bg-muted/25 p-2 text-xs dark:bg-white/[0.03]">
          {[left, right].map((period, index) => (
            <div key={period.id}>
              {index > 0 ? <div className="border-border mb-2 border-t dark:border-white/10" /> : null}
              <div className="flex items-center gap-1.5">
                <ImageIcon className="text-brand-light size-3.5" aria-hidden />
                <span className="text-foreground font-medium">{period.label}</span>
              </div>
              <MockStatRow label="采集" value={period.date} mono />
              <MockStatRow label="分辨率" value={period.resolution} mono />
            </div>
          ))}
        </div>
      </MockContentSection>

      <Button type="button" size="sm" className="h-8 w-full gap-1.5 text-xs">
        <SplitSquareHorizontalIcon className="size-3.5" aria-hidden />
        应用对比
      </Button>
      <p className="text-muted-foreground flex items-center gap-1 text-[10px]">
        <CalendarIcon className="size-3" aria-hidden />
        ortho-imagery-comparison-plugin
      </p>
    </MockToolPanelRoot>
  )
}
