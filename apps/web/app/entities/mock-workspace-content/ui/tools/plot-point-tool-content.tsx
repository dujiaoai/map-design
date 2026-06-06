import { Button, Input } from '@repo/ui'
import { CircleDotIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockStepGuide } from '../primitives/mock-step-guide'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

const STYLE_OPTIONS = [
  { id: 'default', label: '默认', color: 'bg-primary' },
  { id: 'alert', label: '警示', color: 'bg-amber-500' },
  { id: 'info', label: '信息', color: 'bg-sky-500' },
] as const

export function PlotPointToolContent(_props: MockToolContentProps) {
  const [styleId, setStyleId] = useState<(typeof STYLE_OPTIONS)[number]['id']>('default')
  const [name, setName] = useState('巡检点位-01')

  return (
    <MockToolPanelRoot>
      <MockContentSection title="操作指引">
        <MockStepGuide
          steps={[
            { label: '在地图上单击放置兴趣点', active: true },
            { label: '填写名称与样式', detail: '支持拖拽调整位置' },
            { label: '保存至当前项目图层', done: false },
          ]}
        />
      </MockContentSection>

      <MockContentSection title="点位属性">
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-muted-foreground text-xs">名称</span>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-8 text-xs"
              placeholder="输入点位名称"
            />
          </label>
          <MockStatRow label="经度" value="120.158432" mono />
          <MockStatRow label="纬度" value="30.281905" mono />
          <MockStatRow label="高程" value="12.4 m" mono />
        </div>
      </MockContentSection>

      <MockContentSection title="样式">
        <div className="flex gap-2">
          {STYLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={styleId === option.id}
              onClick={() => setStyleId(option.id)}
              className="border-border hover:bg-muted/50 flex flex-1 flex-col items-center gap-1 rounded-md border px-2 py-2 text-xs transition-colors data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10"
              data-active={styleId === option.id}
            >
              <span className={`size-3 rounded-full ${option.color}`} aria-hidden />
              {option.label}
            </button>
          ))}
        </div>
      </MockContentSection>

      <Button type="button" size="sm" className="h-8 w-full text-xs">
        <CircleDotIcon className="size-3.5" aria-hidden />
        保存兴趣点
      </Button>
    </MockToolPanelRoot>
  )
}
