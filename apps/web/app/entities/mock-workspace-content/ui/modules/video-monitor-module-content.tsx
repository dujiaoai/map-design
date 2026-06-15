import { Badge, Button, cn } from '@repo/ui'
import { CircleIcon, PlayIcon, VideoIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_CAMERAS = [
  {
    id: 'cam1',
    name: '西湖断桥监控',
    region: '杭州市 · 西湖区',
    online: true,
    protocol: 'GB28181',
  },
  {
    id: 'cam2',
    name: '钱江新城路口',
    region: '杭州市 · 上城区',
    online: true,
    protocol: 'RTSP',
  },
  {
    id: 'cam3',
    name: '萧山机场净空',
    region: '杭州市 · 萧山区',
    online: false,
    protocol: 'GB28181',
  },
  {
    id: 'cam4',
    name: '运河拱宸桥',
    region: '杭州市 · 拱墅区',
    online: true,
    protocol: 'HLS',
  },
] as const

export function VideoMonitorModuleContent(_props: MockModuleContentProps) {
  const [activeId, setActiveId] = useState<string>('cam1')

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="监控点位">
        <ul className="space-y-2">
          {MOCK_CAMERAS.map((camera) => {
            const active = activeId === camera.id
            return (
              <li key={camera.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(camera.id)}
                  className={cn(
                    'border-border flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors',
                    active
                      ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                      : 'bg-background/60 hover:border-primary/30 dark:bg-black/20',
                  )}
                >
                  <div className="bg-muted/50 relative flex size-10 shrink-0 items-center justify-center rounded-md">
                    <VideoIcon className="text-brand-light size-4" aria-hidden />
                    <CircleIcon
                      className={cn(
                        'absolute -top-0.5 -right-0.5 size-2.5 fill-current',
                        camera.online ? 'text-emerald-500' : 'text-muted-foreground',
                      )}
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground truncate font-medium">{camera.name}</p>
                    <p className="text-muted-foreground truncate text-xs">{camera.region}</p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    {camera.protocol}
                  </Badge>
                </button>
              </li>
            )
          })}
        </ul>
        <Button type="button" size="sm" className="mt-3 w-full gap-1.5">
          <PlayIcon className="size-3.5" aria-hidden />
          播放选中点位
        </Button>
      </MockContentSection>
      <p className="text-muted-foreground text-xs">点击地图监控图标可联动播放 · 演示 mock</p>
    </div>
  )
}
