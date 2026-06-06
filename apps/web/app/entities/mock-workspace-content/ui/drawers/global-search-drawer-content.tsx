import { cn } from '@repo/ui'
import { ClockIcon, CrosshairIcon, MapPinIcon, SearchIcon, ShapesIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { buildSearchSuggestions, type GlobalSearchSuggestion } from '~/features/global-search'
import { useMapWorkspaceStore } from '~/features/map-workspace'

import type { MockDrawerToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockEmptyState } from '../primitives/mock-empty-state'

const RECENT_SEARCHES = ['西湖风景名胜区', '120.15, 30.28', '机库-HZ-03'] as const

function suggestionIcon(kind: GlobalSearchSuggestion['kind']) {
  switch (kind) {
    case 'coordinate':
      return CrosshairIcon
    case 'feature':
      return ShapesIcon
    case 'place':
      return MapPinIcon
    default:
      return SearchIcon
  }
}

export function GlobalSearchDrawerContent(_props: MockDrawerToolContentProps) {
  const globalSearchQuery = useMapWorkspaceStore((state) => state.globalSearchQuery)
  const setGlobalSearchQuery = useMapWorkspaceStore((state) => state.setGlobalSearchQuery)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const query = globalSearchQuery.trim()
  const suggestions = useMemo(() => buildSearchSuggestions(query, 12), [query])

  const resultItems = suggestions.filter((item) => item.kind !== 'hint')

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4 text-sm">
      <p className="text-muted-foreground text-xs leading-relaxed">
        地图区域保持可操作；在此查看完整检索结果与历史记录。顶栏输入会同步至本面板。
      </p>

      {query ? (
        <MockContentSection title={`「${query}」的检索结果`}>
          {resultItems.length > 0 ? (
            <ul className="space-y-1">
              {resultItems.map((item) => {
                const Icon = suggestionIcon(item.kind)
                const active = selectedId === item.id
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedId(item.id)
                        setGlobalSearchQuery(item.query)
                      }}
                      className={cn(
                        'hover:bg-muted/50 flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left text-xs transition-colors',
                        active
                          ? 'border-primary/40 bg-primary/10'
                          : 'border-border bg-background/50 dark:bg-black/15',
                      )}
                    >
                      <Icon className="text-brand-light mt-0.5 size-4 shrink-0" aria-hidden />
                      <span className="min-w-0 flex-1">
                        <span className="text-foreground block font-medium">{item.title}</span>
                        {item.subtitle ? (
                          <span className="text-muted-foreground">{item.subtitle}</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <MockEmptyState
              icon={SearchIcon}
              title="暂无匹配结果"
              description="尝试更短的关键词，或输入「经度, 纬度」定位坐标。"
            />
          )}
        </MockContentSection>
      ) : (
        <MockContentSection title="开始检索">
          <MockEmptyState
            icon={SearchIcon}
            title="输入地点、坐标或要素"
            description="在顶栏搜索框输入关键词，或从下方历史记录快速选择。"
          />
        </MockContentSection>
      )}

      <MockContentSection title="最近搜索">
        <ul className="space-y-1">
          {RECENT_SEARCHES.map((term) => (
            <li key={term}>
              <button
                type="button"
                onClick={() => setGlobalSearchQuery(term)}
                className="text-muted-foreground hover:text-foreground hover:bg-muted/40 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors"
              >
                <ClockIcon className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{term}</span>
              </button>
            </li>
          ))}
        </ul>
      </MockContentSection>
    </div>
  )
}
