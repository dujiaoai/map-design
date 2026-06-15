import { Button, Input } from '@repo/ui'
import { MapPinIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockStatRow } from '../primitives/mock-stat-row'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

export function LocatePointToolContent(_props: MockToolContentProps) {
  const [lng, setLng] = useState('120.153576')
  const [lat, setLat] = useState('30.287459')

  return (
    <MockToolPanelRoot>
      <MockContentSection title="输入坐标">
        <div className="space-y-2">
          <label className="block space-y-1">
            <span className="text-muted-foreground text-xs">经度 (Lng)</span>
            <Input
              value={lng}
              onChange={(event) => setLng(event.target.value)}
              className="cc-mono h-8 text-xs tabular-nums"
              placeholder="120.000000"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-muted-foreground text-xs">纬度 (Lat)</span>
            <Input
              value={lat}
              onChange={(event) => setLat(event.target.value)}
              className="cc-mono h-8 text-xs tabular-nums"
              placeholder="30.000000"
            />
          </label>
        </div>
      </MockContentSection>

      <MockContentSection title="定位选项">
        <MockStatRow label="坐标系" value="EPSG:4326" mono />
        <MockStatRow label="缩放级别" value="16" mono />
      </MockContentSection>

      <Button type="button" size="sm" className="h-8 w-full gap-1.5 text-xs">
        <MapPinIcon className="size-3.5" aria-hidden />
        定位到坐标
      </Button>
    </MockToolPanelRoot>
  )
}
