import { cn } from '@repo/ui'
import { CircleIcon, MinusIcon, SquareIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MOCK_MODULE_CONTENT_ROOT_CLASS } from '../primitives/mock-module-content-root'
import { MockContentSection } from '../primitives/mock-content-section'

interface LegendItem {
  id: string
  label: string
  color: string
  shape: 'line' | 'fill' | 'point'
  visible: boolean
}

const MOCK_LEGEND_GROUPS: Array<{ title: string; items: LegendItem[] }> = [
  {
    title: '行政边界',
    items: [
      { id: 'l1', label: '省级界', color: '#f59e0b', shape: 'line', visible: true },
      { id: 'l2', label: '区县界', color: '#eab308', shape: 'line', visible: true },
    ],
  },
  {
    title: '业务专题',
    items: [
      { id: 'l3', label: '禁飞区', color: '#ef4444', shape: 'fill', visible: true },
      { id: 'l4', label: '巡检航线', color: '#38bdf8', shape: 'line', visible: true },
      { id: 'l5', label: '机库点位', color: '#22c55e', shape: 'point', visible: false },
    ],
  },
]

function LegendSwatch({ item }: { item: LegendItem }) {
  if (item.shape === 'point') {
    return (
      <span
        className="inline-flex size-4 items-center justify-center"
        style={{ color: item.color }}
        aria-hidden
      >
        <CircleIcon className="size-3 fill-current" />
      </span>
    )
  }
  if (item.shape === 'line') {
    return (
      <span className="inline-flex size-4 items-center justify-center" aria-hidden>
        <MinusIcon className="size-4" style={{ color: item.color }} strokeWidth={3} />
      </span>
    )
  }
  return (
    <span
      className="inline-block size-3.5 rounded-sm border border-black/10"
      style={{ backgroundColor: item.color }}
      aria-hidden
    />
  )
}

export function LegendModuleContent(_props: MockModuleContentProps) {
  const [groups, setGroups] = useState(MOCK_LEGEND_GROUPS)

  function toggleItem(groupIndex: number, itemId: string) {
    setGroups((current) =>
      current.map((group, index) =>
        index !== groupIndex
          ? group
          : {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId ? { ...item, visible: !item.visible } : item,
              ),
            },
      ),
    )
  }

  return (
    <div className={MOCK_MODULE_CONTENT_ROOT_CLASS}>
      <MockContentSection title="图例">
        <div className="space-y-3">
          {groups.map((group, groupIndex) => (
            <div
              key={group.title}
              className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15"
            >
              <p className="text-muted-foreground mb-2 text-[10px] font-medium tracking-wide uppercase">
                {group.title}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => toggleItem(groupIndex, item.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                        item.visible ? 'hover:bg-muted/40' : 'opacity-45 hover:opacity-70',
                      )}
                    >
                      <LegendSwatch item={item} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      <SquareIcon
                        className={cn(
                          'size-3 shrink-0',
                          item.visible ? 'text-brand-light/80' : 'text-muted-foreground',
                        )}
                        aria-hidden
                      />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </MockContentSection>
      <p className="text-muted-foreground text-xs">与专题图层勾选联动 · 演示 mock</p>
    </div>
  )
}
