import { Badge, Button, cn } from '@repo/ui'
import { EyeIcon, LayersIcon, MapPinIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const SPECIAL_TOPICS = [
  { id: 'land-use', label: '土地利用', layerCount: 4, updatedAt: '2025-03' },
  { id: 'building', label: '建筑物轮廓', layerCount: 2, updatedAt: '2025-01' },
  { id: 'pipeline', label: '地下管线', layerCount: 6, updatedAt: '2024-11' },
] as const

const MOCK_ATTRIBUTES = [
  { key: 'OBJECTID', value: '10284' },
  { key: '地块编号', value: 'HZ-XH-2025-018' },
  { key: '用地性质', value: '商业用地' },
  { key: '面积 (㎡)', value: '12,480.6' },
  { key: '所属区划', value: '杭州市 · 西湖区' },
] as const

export function PropertyViewModuleContent(_props: MockModuleContentProps) {
  const [activeTopicId, setActiveTopicId] = useState<string>('land-use')
  const [selectedFeature, setSelectedFeature] = useState(true)

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="专题图">
        <div className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
            <LayersIcon className="size-3.5" aria-hidden />
            选择专题并叠加至地图
          </div>
          <ul className="space-y-1">
            {SPECIAL_TOPICS.map((topic) => {
              const active = activeTopicId === topic.id
              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTopicId(topic.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                      active ? 'bg-primary/10 text-foreground' : 'hover:bg-muted/40',
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate font-medium">{topic.label}</span>
                    <Badge variant="outline" className="shrink-0 text-[10px]">
                      {topic.layerCount} 层
                    </Badge>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
        <Button type="button" size="sm" variant="outline" className="mt-2 w-full">
          应用至地图
        </Button>
      </MockContentSection>

      <MockContentSection title="要素属性">
        {selectedFeature ? (
          <>
            <div className="border-border flex items-center gap-2 rounded-lg border bg-background/60 px-3 py-2 dark:bg-black/20">
              <MapPinIcon className="text-brand-light size-4 shrink-0" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">地块 HZ-XH-2025-018</p>
                <p className="text-muted-foreground text-xs">点击地图要素查看属性</p>
              </div>
              <Badge variant="secondary" className="shrink-0 text-[10px]">
                已选中
              </Badge>
            </div>
            <dl className="border-border mt-2 rounded-lg border bg-muted/20 dark:bg-black/15">
              {MOCK_ATTRIBUTES.map((row) => (
                <div
                  key={row.key}
                  className="border-border grid grid-cols-[5.5rem_1fr] gap-x-2 border-b px-3 py-2 text-xs last:border-b-0"
                >
                  <dt className="text-muted-foreground">{row.key}</dt>
                  <dd className="text-foreground font-mono break-all">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-2 w-full text-xs"
              onClick={() => setSelectedFeature(false)}
            >
              清除选中
            </Button>
          </>
        ) : (
          <div className="border-border flex flex-col items-center gap-2 rounded-lg border border-dashed px-4 py-8 text-center dark:bg-black/10">
            <EyeIcon className="text-muted-foreground size-8" aria-hidden />
            <p className="text-muted-foreground text-sm">在地图上点选要素以查看属性</p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setSelectedFeature(true)}
            >
              模拟选中要素
            </Button>
          </div>
        )}
      </MockContentSection>
    </div>
  )
}
