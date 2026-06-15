import { Button, Input } from '@repo/ui'
import { CopyIcon, CrosshairIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockStepGuide } from '../primitives/mock-step-guide'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

export function PickPointToolContent(_props: MockToolContentProps) {
  const [picked, setPicked] = useState(true)
  const lng = '120.158432'
  const lat = '30.281905'

  return (
    <MockToolPanelRoot>
      <MockContentSection title="操作指引">
        <MockStepGuide
          steps={[
            { label: '在地图上单击拾取坐标', active: !picked, done: picked },
            { label: '复制或写入表单', detail: picked ? '已拾取 1 个点' : undefined, active: picked },
          ]}
        />
      </MockContentSection>

      {picked ? (
        <MockContentSection title="拾取结果">
          <div className="border-border space-y-1.5 rounded-md border bg-muted/25 p-2 dark:bg-white/[0.03]">
            <MockStatRow label="经度" value={lng} mono highlight />
            <MockStatRow label="纬度" value={lat} mono highlight />
            <MockStatRow label="坐标系" value="EPSG:4326" mono />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" size="sm" variant="outline" className="h-8 flex-1 text-xs">
              <CopyIcon className="size-3.5" aria-hidden />
              复制
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 flex-1 text-xs"
              onClick={() => setPicked(false)}
            >
              重新拾取
            </Button>
          </div>
        </MockContentSection>
      ) : (
        <MockContentSection title="等待拾取">
          <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <CrosshairIcon className="size-3.5" aria-hidden />
            点击地图任意位置获取坐标
          </p>
          <Button type="button" size="sm" className="mt-2 h-8 w-full text-xs" onClick={() => setPicked(true)}>
            模拟拾取
          </Button>
        </MockContentSection>
      )}
    </MockToolPanelRoot>
  )
}
