import { Badge, Button } from '@repo/ui'
import { CopyIcon, ExternalLinkIcon, Share2Icon, UsersIcon } from 'lucide-react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

const MOCK_SHARES = [
  {
    id: 'sh1',
    title: '西湖巡检协作视图',
    url: 'https://map.example/s/xihu-2025',
    viewers: 12,
    expires: '7 天后',
    status: 'active',
  },
  {
    id: 'sh2',
    title: 'G25 段预警共享',
    url: 'https://map.example/s/g25-alert',
    viewers: 3,
    expires: '已过期',
    status: 'expired',
  },
  {
    id: 'sh3',
    title: '钱江新城正射对比',
    url: 'https://map.example/s/qjxc-compare',
    viewers: 28,
    expires: '30 天后',
    status: 'active',
  },
] as const

export function CustomLiveShareModuleContent(_props: MockModuleContentProps) {
  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="分享链接">
        <ul className="space-y-2">
          {MOCK_SHARES.map((share) => (
            <li
              key={share.id}
              className="border-border rounded-lg border bg-background/60 p-3 dark:bg-black/20"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground font-medium">{share.title}</p>
                  <p className="text-muted-foreground cc-mono mt-0.5 truncate text-[10px]">
                    {share.url}
                  </p>
                </div>
                <Badge
                  variant={share.status === 'active' ? 'secondary' : 'outline'}
                  className="shrink-0 text-[10px]"
                >
                  {share.expires}
                </Badge>
              </div>
              <div className="text-muted-foreground mt-2 flex items-center gap-1 text-xs">
                <UsersIcon className="size-3.5" aria-hidden />
                {share.viewers} 人访问
              </div>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" className="h-7 flex-1 text-xs">
                  <CopyIcon className="size-3" aria-hidden />
                  复制
                </Button>
                <Button type="button" size="sm" className="h-7 flex-1 text-xs">
                  <ExternalLinkIcon className="size-3" aria-hidden />
                  打开
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <Button type="button" size="sm" className="mt-3 w-full gap-1.5">
          <Share2Icon className="size-3.5" aria-hidden />
          创建分享
        </Button>
      </MockContentSection>
      <p className="text-muted-foreground text-xs">租户功能 custom.live-share · 演示 mock</p>
    </div>
  )
}
