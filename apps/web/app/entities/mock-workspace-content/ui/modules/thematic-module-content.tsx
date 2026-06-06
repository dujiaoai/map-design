import { cn } from '@repo/ui'
import { ChevronRightIcon, EyeIcon, EyeOffIcon, LayersIcon } from 'lucide-react'
import { useState } from 'react'

import type { MockModuleContentProps } from '../../model/types'
import { MockContentSection } from '../primitives/mock-content-section'

interface LayerNode {
  id: string
  label: string
  visible: boolean
  children?: LayerNode[]
}

const INITIAL_LAYERS: LayerNode[] = [
  {
    id: 'base',
    label: '底图',
    visible: true,
    children: [
      { id: 'satellite', label: '2025 卫星影像', visible: true },
      { id: 'terrain', label: '地形晕渲', visible: false },
    ],
  },
  {
    id: 'vector',
    label: '矢量专题',
    visible: true,
    children: [
      { id: 'boundary', label: '行政边界', visible: true },
      { id: 'road', label: '道路网络', visible: true },
      { id: 'water', label: '水系', visible: false },
    ],
  },
  {
    id: 'biz',
    label: '业务图层',
    visible: true,
    children: [{ id: 'uav-route', label: '巡检航线', visible: true }],
  },
]

function LayerTreeNode({
  node,
  depth,
  onToggle,
}: {
  node: LayerNode
  depth: number
  onToggle: (id: string) => void
}) {
  const [open, setOpen] = useState(true)
  const hasChildren = Boolean(node.children?.length)

  return (
    <li>
      <div
        className="hover:bg-muted/40 flex items-center gap-1 rounded-md py-1 pr-1"
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={open ? '收起' : '展开'}
            onClick={() => setOpen((value) => !value)}
            className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center rounded"
          >
            <ChevronRightIcon
              className={cn('size-3.5 transition-transform', open && 'rotate-90')}
              aria-hidden
            />
          </button>
        ) : (
          <span className="size-5 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          aria-label={node.visible ? '隐藏图层' : '显示图层'}
          onClick={() => onToggle(node.id)}
          className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center"
        >
          {node.visible ? (
            <EyeIcon className="size-3.5 text-brand-light/80" aria-hidden />
          ) : (
            <EyeOffIcon className="size-3.5" aria-hidden />
          )}
        </button>
        <span className={cn('min-w-0 flex-1 truncate text-xs', !node.visible && 'opacity-50')}>
          {node.label}
        </span>
      </div>
      {hasChildren && open ? (
        <ul>
          {node.children!.map((child) => (
            <LayerTreeNode key={child.id} node={child} depth={depth + 1} onToggle={onToggle} />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

function toggleNodeVisibility(nodes: LayerNode[], id: string): LayerNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      return { ...node, visible: !node.visible }
    }
    if (node.children) {
      return { ...node, children: toggleNodeVisibility(node.children, id) }
    }
    return node
  })
}

export function ThematicModuleContent(_props: MockModuleContentProps) {
  const [layers, setLayers] = useState(INITIAL_LAYERS)

  function handleToggle(id: string) {
    setLayers((current) => toggleNodeVisibility(current, id))
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4 text-sm">
      <MockContentSection title="图层树">
        <div className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
            <LayersIcon className="size-3.5" aria-hidden />
            当前项目 · 12 个图层
          </div>
          <ul>
            {layers.map((node) => (
              <LayerTreeNode key={node.id} node={node} depth={0} onToggle={handleToggle} />
            ))}
          </ul>
        </div>
      </MockContentSection>
    </div>
  )
}
