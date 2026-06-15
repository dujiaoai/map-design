import { Button, cn } from '@repo/ui'
import { ChevronRightIcon, MapIcon, SearchIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockToolContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'
import { MockToolPanelRoot } from '../primitives/mock-tool-panel-root'

interface RegionNode {
  id: string
  name: string
  code: string
  children?: RegionNode[]
}

const REGION_TREE: RegionNode[] = [
  {
    id: '330000',
    name: '浙江省',
    code: '330000',
    children: [
      {
        id: '330100',
        name: '杭州市',
        code: '330100',
        children: [
          { id: '330106', name: '西湖区', code: '330106' },
          { id: '330108', name: '滨江区', code: '330108' },
          { id: '330109', name: '萧山区', code: '330109' },
        ],
      },
      {
        id: '330500',
        name: '湖州市',
        code: '330500',
        children: [{ id: '330521', name: '德清县', code: '330521' }],
      },
    ],
  },
]

function findPath(nodes: RegionNode[], targetId: string, trail: RegionNode[] = []): RegionNode[] | null {
  for (const node of nodes) {
    const next = [...trail, node]
    if (node.id === targetId) return next
    if (node.children) {
      const found = findPath(node.children, targetId, next)
      if (found) return found
    }
  }
  return null
}

export function AdminDivisionsToolContent(_props: MockToolContentProps) {
  const [selectedId, setSelectedId] = useState('330106')
  const [query, setQuery] = useState('')

  const path = findPath(REGION_TREE, selectedId) ?? []
  const current = path[path.length - 1]
  const parent = path[path.length - 2]
  const listNodes =
    current?.children && current.children.length > 0
      ? current.children
      : (parent?.children ?? REGION_TREE)

  const filtered = query.trim()
    ? listNodes.filter(
        (item) =>
          item.name.includes(query.trim()) || item.code.includes(query.trim()),
      )
    : listNodes

  return (
    <MockToolPanelRoot>
      <p className="text-muted-foreground text-xs leading-relaxed">
        选择行政区划后地图定位并加载围栏图层。演示 mock，与 region-navigator 插件对齐。
      </p>

      <MockContentSection title="当前路径">
        <nav aria-label="区划路径" className="flex flex-wrap items-center gap-0.5 text-xs">
          {path.map((node, index) => (
            <span key={node.id} className="flex items-center gap-0.5">
              {index > 0 ? (
                <ChevronRightIcon className="text-muted-foreground size-3" aria-hidden />
              ) : null}
              <button
                type="button"
                onClick={() => setSelectedId(node.id)}
                className={cn(
                  'rounded px-1 py-0.5 transition-colors',
                  index === path.length - 1
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {node.name}
              </button>
            </span>
          ))}
        </nav>
      </MockContentSection>

      <MockContentSection title="搜索区划">
        <div className="relative">
          <SearchIcon
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名称或区划代码"
            className="border-border bg-background/60 h-8 w-full rounded-md border pr-2 pl-8 text-xs dark:bg-black/20"
          />
        </div>
      </MockContentSection>

      <MockContentSection title="下级区划">
        <ul className="space-y-1">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  'hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                  selectedId === item.id && 'bg-primary/10 font-medium',
                )}
              >
                <span>{item.name}</span>
                <span className="text-muted-foreground cc-mono text-[10px]">{item.code}</span>
              </button>
            </li>
          ))}
        </ul>
      </MockContentSection>

      <Button type="button" size="sm" className="h-8 w-full gap-1.5 text-xs">
        <MapIcon className="size-3.5" aria-hidden />
        定位至 {current?.name ?? '—'}
      </Button>
    </MockToolPanelRoot>
  )
}
