import { Badge, Button, cn } from '@repo/ui'
import { CameraIcon, MapPinIcon, UsersIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_CLUSTERS = [
  {
    id: 'c1',
    name: '西湖景区',
    spotCount: 24,
    region: '杭州市 · 西湖区',
    lastCapture: '2025-05-12',
  },
  {
    id: 'c2',
    name: '灵隐飞来峰',
    spotCount: 8,
    region: '杭州市 · 西湖区',
    lastCapture: '2025-04-28',
  },
  {
    id: 'c3',
    name: '千岛湖中心湖区',
    spotCount: 15,
    region: '杭州市 · 淳安县',
    lastCapture: '2025-03-20',
  },
] as const

const MOCK_SPOTS = [
  { id: 's1', title: '断桥残雪', clusterId: 'c1', views: 1280 },
  { id: 's2', title: '雷峰塔南望', clusterId: 'c1', views: 956 },
  { id: 's3', title: '三潭印月', clusterId: 'c1', views: 742 },
  { id: 's4', title: '北高峰索道', clusterId: 'c2', views: 418 },
] as const

export function ScenicSpotsModuleContent(_props: MockModuleContentProps) {
  const [activeClusterId, setActiveClusterId] = useState<string>('c1')

  const spots = MOCK_SPOTS.filter((spot) => spot.clusterId === activeClusterId)
  const activeCluster = MOCK_CLUSTERS.find((cluster) => cluster.id === activeClusterId)

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="景点聚类">
        <ul className="space-y-2">
          {MOCK_CLUSTERS.map((cluster) => {
            const active = activeClusterId === cluster.id
            return (
              <li key={cluster.id}>
                <button
                  type="button"
                  onClick={() => setActiveClusterId(cluster.id)}
                  className={cn(
                    'border-border flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'bg-background/60 hover:border-primary/30 dark:bg-black/20',
                  )}
                >
                  <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                    <UsersIcon className="size-4" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground font-medium">{cluster.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{cluster.region}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {cluster.spotCount} 点
                  </Badge>
                </button>
              </li>
            )
          })}
        </ul>
      </MockContentSection>

      <MockContentSection title={activeCluster ? `${activeCluster.name} · 全景点位` : '全景点位'}>
        <ul className="space-y-2">
          {spots.map((spot) => (
            <li
              key={spot.id}
              className="border-border hover:border-primary/30 group flex items-center gap-3 rounded-lg border bg-background/60 p-3 transition-colors dark:bg-black/20"
            >
              <div className="bg-muted/50 flex size-8 shrink-0 items-center justify-center rounded-md">
                <CameraIcon className="text-brand-light size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate font-medium">{spot.title}</p>
                <p className="text-muted-foreground text-xs">{spot.views.toLocaleString()} 次浏览</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 shrink-0 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                <MapPinIcon className="size-3" aria-hidden />
                定位
              </Button>
            </li>
          ))}
        </ul>
        {activeCluster ? (
          <p className="text-muted-foreground mt-2 text-xs">
            最近采集 {activeCluster.lastCapture} · 地图聚类展示
          </p>
        ) : null}
      </MockContentSection>
    </div>
  )
}
