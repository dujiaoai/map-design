import { Button } from '@repo/ui'
import { MapPinIcon, RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockStepGuide } from '../primitives/mock-step-guide'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

const MOCK_POINTS = [
  { id: 'a', label: '起点', lng: 120.153576, lat: 30.287459 },
  { id: 'b', label: '终点', lng: 120.161892, lat: 30.274318 },
] as const

export function MeasureDistanceToolContent(_props: MockToolContentProps) {
  const [step, setStep] = useState<0 | 1 | 2>(1)

  const steps = [
    {
      label: '在地图上点击起点',
      detail: step >= 1 ? '已选 1 个点' : undefined,
      done: step > 0,
      active: step === 0,
    },
    {
      label: '继续点击添加节点，双击结束',
      detail: step >= 1 ? '已选 2 个点' : undefined,
      done: step > 1,
      active: step === 1,
    },
    {
      label: '查看量测结果',
      detail: step === 2 ? '可导出或复制坐标' : undefined,
      done: step === 2,
      active: step === 2,
    },
  ]

  return (
    <MockToolPanelRoot>
      <MockContentSection title="操作指引">
        <MockStepGuide steps={steps} />
      </MockContentSection>

      <MockContentSection title="当前量测">
        <div className="border-border space-y-1.5 rounded-md border bg-muted/25 p-2 dark:bg-white/[0.03]">
          <MockStatRow label="总距离" value="1.24 km" mono highlight />
          <MockStatRow label="水平距离" value="1.22 km" mono />
          <MockStatRow label="节点数" value="2" mono />
        </div>
      </MockContentSection>

      <MockContentSection title="节点坐标">
        <ul className="space-y-1">
          {MOCK_POINTS.map((point) => (
            <li
              key={point.id}
              className="border-border flex items-start gap-2 rounded-md border bg-background/50 px-2 py-1.5 text-xs dark:bg-black/20"
            >
              <MapPinIcon className="text-brand-light mt-0.5 size-3.5 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-foreground font-medium">{point.label}</p>
                <p className="cc-mono text-muted-foreground tabular-nums">
                  {point.lng.toFixed(6)}, {point.lat.toFixed(6)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </MockContentSection>

      <div className="flex gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 flex-1 text-xs"
          onClick={() => setStep(0)}
        >
          <RotateCcwIcon className="size-3.5" aria-hidden />
          重新量测
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-8 flex-1 text-xs"
          onClick={() => setStep(2)}
        >
          完成
        </Button>
      </div>
    </MockToolPanelRoot>
  )
}
