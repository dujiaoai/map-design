import { Button } from '@repo/ui'
import { PlayIcon, StarIcon, VideoIcon } from 'lucide-react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_FAVORITES = [
  {
    id: 'f1',
    dock: '机库-HZ-01',
    channel: 'M30T-01 直播',
    lastViewed: '今天 08:12',
  },
  {
    id: 'f2',
    dock: '机库-HZ-03',
    channel: '机场监控',
    lastViewed: '昨天 17:40',
  },
] as const

export function UavCollectModuleContent(_props: MockModuleContentProps) {
  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="收藏机库">
        <ul className="space-y-2">
          {MOCK_FAVORITES.map((item) => (
            <li
              key={item.id}
              className="border-border hover:border-primary/30 group rounded-lg border bg-background/60 p-3 transition-colors dark:bg-black/20"
            >
              <div className="flex items-start gap-2">
                <StarIcon
                  className="mt-0.5 size-4 shrink-0 fill-amber-400 text-amber-400"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium">{item.dock}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.channel} · {item.lastViewed}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="button" size="sm" variant="outline" className="h-7 flex-1 text-xs">
                  <VideoIcon className="size-3" aria-hidden />
                  直播
                </Button>
                <Button type="button" size="sm" className="h-7 flex-1 text-xs">
                  <PlayIcon className="size-3" aria-hidden />
                  打开
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </MockContentSection>
      <p className="text-muted-foreground text-xs">演示 mock · 接入 cloud/uav 后同步真实收藏</p>
    </div>
  )
}
