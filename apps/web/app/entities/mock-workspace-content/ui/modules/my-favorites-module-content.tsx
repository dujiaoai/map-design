import { Button } from '@repo/ui'
import { BookmarkIcon, MapPinIcon, StarIcon } from 'lucide-react'

import type { MockModuleContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockEmptyState } from '../primitives/mock-empty-state'

const MOCK_FAVORITES = [
  {
    id: 'f1',
    title: '西湖巡检区域',
    type: '面要素',
    updatedAt: '今天 09:24',
    starred: true,
  },
  {
    id: 'f2',
    title: '机库-HZ-03',
    type: '点位',
    updatedAt: '昨天 16:10',
    starred: false,
  },
  {
    id: 'f3',
    title: '钱江新城正射对比',
    type: '书签视图',
    updatedAt: '3 月 8 日',
    starred: true,
  },
] as const

export function MyFavoritesModuleContent(_props: MockModuleContentProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm">
      <MockContentSection title="我的收藏">
        <ul className="space-y-2">
          {MOCK_FAVORITES.map((item) => (
            <li
              key={item.id}
              className="border-border hover:border-primary/30 group rounded-lg border bg-background/60 p-3 transition-colors dark:bg-black/20"
            >
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 flex size-8 shrink-0 items-center justify-center rounded-md">
                  {item.type === '点位' ? (
                    <MapPinIcon className="text-brand-light size-4" aria-hidden />
                  ) : (
                    <BookmarkIcon className="text-brand-light size-4" aria-hidden />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <p className="text-foreground truncate font-medium">{item.title}</p>
                    {item.starred ? (
                      <StarIcon
                        className="size-3 shrink-0 fill-amber-400 text-amber-400"
                        aria-label="已标星"
                      />
                    ) : null}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {item.type} · {item.updatedAt}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Button type="button" size="sm" variant="outline" className="h-7 flex-1 text-xs">
                  定位
                </Button>
                <Button type="button" size="sm" className="h-7 flex-1 text-xs">
                  打开
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </MockContentSection>

      <MockEmptyState
        icon={BookmarkIcon}
        title="收藏更多内容"
        description="在地图上右键要素或使用工具栏星标，即可加入收藏。"
        className="py-6"
      />
    </div>
  )
}
