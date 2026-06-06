import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { Columns2Icon, LayersIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

const LAYER_OPTIONS = [
  { id: 'left', label: '2024 正射影像', date: '2024-06-12' },
  { id: 'right', label: '2025 正射影像', date: '2025-03-08' },
] as const

type LayerId = (typeof LAYER_OPTIONS)[number]['id']

function LayerSideSelect({
  id,
  label,
  value,
  onValueChange,
}: {
  id: string
  label: string
  value: LayerId
  onValueChange: (value: LayerId) => void
}) {
  return (
    <div className="space-y-1">
      <span id={`${id}-label`} className="text-muted-foreground text-[11px]">
        {label}
      </span>
      <Select value={value} onValueChange={(next) => onValueChange(next as LayerId)}>
        <SelectTrigger
          id={id}
          size="sm"
          aria-labelledby={`${id}-label`}
          className="h-8 w-full text-xs"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {LAYER_OPTIONS.map((layer) => (
            <SelectItem key={layer.id} value={layer.id} className="text-xs">
              {layer.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export function SwipeCompareToolContent(_props: MockToolContentProps) {
  const [split, setSplit] = useState(52)
  const [leftId, setLeftId] = useState<(typeof LAYER_OPTIONS)[number]['id']>('left')
  const [rightId, setRightId] = useState<(typeof LAYER_OPTIONS)[number]['id']>('right')

  const leftLayer = LAYER_OPTIONS.find((item) => item.id === leftId)!
  const rightLayer = LAYER_OPTIONS.find((item) => item.id === rightId)!

  return (
    <MockToolPanelRoot>
      <p className="text-muted-foreground text-xs leading-relaxed">
        拖动地图中央分割线对比两期影像；本面板可切换图层与分割比例。
      </p>

      <MockContentSection title="图层选择">
        <div className="grid grid-cols-2 gap-2">
          <LayerSideSelect
            id="swipe-compare-left-layer"
            label="左屏"
            value={leftId}
            onValueChange={setLeftId}
          />
          <LayerSideSelect
            id="swipe-compare-right-layer"
            label="右屏"
            value={rightId}
            onValueChange={setRightId}
          />
        </div>
      </MockContentSection>

      <MockContentSection title="分割比例">
        <div className="space-y-2">
          <input
            type="range"
            min={10}
            max={90}
            value={split}
            onChange={(event) => setSplit(Number(event.target.value))}
            className="accent-primary w-full"
            aria-label="卷帘分割比例"
          />
          <MockStatRow label="左屏占比" value={`${split}%`} mono highlight />
        </div>
      </MockContentSection>

      <MockContentSection title="图层信息">
        <div className="border-border space-y-1.5 rounded-md border bg-muted/25 p-2 text-xs dark:bg-white/[0.03]">
          <div className="flex items-center gap-1.5">
            <LayersIcon className="text-brand-light size-3.5" aria-hidden />
            <span className="text-foreground font-medium">{leftLayer.label}</span>
          </div>
          <MockStatRow label="采集日期" value={leftLayer.date} mono />
          <div className="border-border my-1 border-t dark:border-white/10" />
          <div className="flex items-center gap-1.5">
            <LayersIcon className="text-brand-light size-3.5" aria-hidden />
            <span className="text-foreground font-medium">{rightLayer.label}</span>
          </div>
          <MockStatRow label="采集日期" value={rightLayer.date} mono />
        </div>
      </MockContentSection>

      <Button type="button" size="sm" variant="outline" className="h-8 w-full text-xs">
        <Columns2Icon className="size-3.5" aria-hidden />
        重置分割线至居中
      </Button>
    </MockToolPanelRoot>
  )
}
