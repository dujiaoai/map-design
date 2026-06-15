import { Button } from '@repo/ui'
import { HexagonIcon, RotateCcwIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockStepGuide } from '../primitives/mock-step-guide'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

export function MeasureAreaToolContent(_props: MockToolContentProps) {
  const [step, setStep] = useState<0 | 1 | 2>(1)

  const steps = [
    {
      label: '在地图上点击多边形顶点',
      detail: step >= 1 ? '已选 4 个顶点' : undefined,
      done: step > 0,
      active: step === 0,
    },
    {
      label: '双击完成绘制',
      detail: step >= 1 ? '多边形已闭合' : undefined,
      done: step > 1,
      active: step === 1,
    },
    {
      label: '查看面积结果',
      detail: step === 2 ? '可导出 GeoJSON' : undefined,
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
          <MockStatRow label="地理面积" value="86,420 m²" mono highlight />
          <MockStatRow label="折合" value="12.96 亩" mono />
          <MockStatRow label="周长" value="1.18 km" mono />
          <MockStatRow label="顶点数" value="4" mono />
        </div>
      </MockContentSection>

      <MockContentSection title="范围预览">
        <div className="border-border flex items-center gap-2 rounded-md border bg-background/50 px-3 py-2 text-xs dark:bg-black/20">
          <HexagonIcon className="text-brand-light size-4 shrink-0" aria-hidden />
          <p className="text-muted-foreground">西湖景区巡检范围 · 演示 mock</p>
        </div>
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
        <Button type="button" size="sm" className="h-8 flex-1 text-xs" onClick={() => setStep(2)}>
          完成
        </Button>
      </div>
    </MockToolPanelRoot>
  )
}
