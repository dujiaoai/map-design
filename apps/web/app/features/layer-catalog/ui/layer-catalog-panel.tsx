import { Badge, Button, cn, Input } from '@repo/ui'
import { EyeIcon, EyeOffIcon, LayersIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'

import {
  useCreateLayerMutation,
  useDeleteLayerMutation,
  useLayersQuery,
  useUpdateLayerMutation,
  type MapLayerSummary,
} from '~/shared/queries/layer-queries'
import { useCanWriteMap } from '~/shared/session/use-session-access'

const LAYER_TYPES = [
  { value: 'thematic', label: '专题' },
  { value: 'ortho', label: '正射' },
  { value: 'region', label: '区划' },
] as const

function layerTypeLabel(layerType: string): string {
  return LAYER_TYPES.find((item) => item.value === layerType)?.label ?? layerType
}

function LayerRow({
  layer,
  canWrite,
  onToggleVisible,
  onDelete,
  busy,
}: {
  layer: MapLayerSummary
  canWrite: boolean
  onToggleVisible: (layer: MapLayerSummary) => void
  onDelete: (layerId: string) => void
  busy: boolean
}) {
  return (
    <li className="hover:bg-muted/40 flex items-center gap-2 rounded-md px-2 py-1.5">
      <button
        type="button"
        disabled={!canWrite || busy}
        aria-label={layer.visible ? '隐藏图层' : '显示图层'}
        onClick={() => onToggleVisible(layer)}
        className="text-muted-foreground hover:text-foreground flex size-5 shrink-0 items-center justify-center disabled:opacity-40"
      >
        {layer.visible ? (
          <EyeIcon className="size-3.5 text-brand-light/80" aria-hidden />
        ) : (
          <EyeOffIcon className="size-3.5" aria-hidden />
        )}
      </button>
      <span className={cn('min-w-0 flex-1 truncate text-xs', !layer.visible && 'opacity-50')}>
        {layer.name}
      </span>
      <Badge variant="outline" className="shrink-0 text-[10px]">
        {layerTypeLabel(layer.layerType)}
      </Badge>
      {canWrite ? (
        <button
          type="button"
          disabled={busy}
          aria-label={`删除 ${layer.name}`}
          onClick={() => onDelete(layer.id)}
          className="text-muted-foreground hover:text-destructive flex size-6 shrink-0 items-center justify-center rounded disabled:opacity-40"
        >
          <Trash2Icon className="size-3.5" aria-hidden />
        </button>
      ) : null}
    </li>
  )
}

function CatalogSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-muted-foreground text-[11px] font-medium tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function LayerCatalogPanel({ className }: { className?: string }) {
  const canWrite = useCanWriteMap()
  const layersQuery = useLayersQuery()
  const createMutation = useCreateLayerMutation()
  const updateMutation = useUpdateLayerMutation()
  const deleteMutation = useDeleteLayerMutation()
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState<string>('thematic')

  const busy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  function handleToggleVisible(layer: MapLayerSummary) {
    if (!canWrite) return
    updateMutation.mutate({
      layerId: layer.id,
      input: {
        name: layer.name,
        layerType: layer.layerType,
        visible: !layer.visible,
        sortOrder: layer.sortOrder,
      },
    })
  }

  function handleDelete(layerId: string) {
    if (!canWrite) return
    deleteMutation.mutate(layerId)
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault()
    const name = newName.trim()
    if (!name || !canWrite) return
    createMutation.mutate(
      { name, layerType: newType, visible: true },
      {
        onSuccess: () => {
          setNewName('')
        },
      },
    )
  }

  const items = layersQuery.data?.items ?? []

  return (
    <div className={className}>
      <CatalogSection title="图层目录">
        <div className="border-border rounded-lg border bg-muted/20 p-2 dark:bg-black/15">
          <div className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs">
            <LayersIcon className="size-3.5" aria-hidden />
            {layersQuery.isPending
              ? '加载图层…'
              : layersQuery.isError
                ? '图层加载失败'
                : `当前租户 · ${items.length} 个图层`}
          </div>

          {layersQuery.isSuccess ? (
            items.length > 0 ? (
              <ul className="space-y-0.5">
                {items.map((layer) => (
                  <LayerRow
                    key={layer.id}
                    layer={layer}
                    canWrite={canWrite}
                    busy={busy}
                    onToggleVisible={handleToggleVisible}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground px-2 py-3 text-xs">暂无图层，可在下方添加。</p>
            )
          ) : null}
        </div>

        {canWrite ? (
          <form onSubmit={handleCreate} className="mt-2 space-y-2">
            <Input
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="新图层名称"
              className="h-8 text-xs"
              disabled={busy}
            />
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(event) => setNewType(event.target.value)}
                disabled={busy}
                className="border-border bg-background h-8 min-w-0 flex-1 rounded-md border px-2 text-xs"
              >
                {LAYER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="outline" disabled={busy || !newName.trim()}>
                <PlusIcon className="size-3.5" aria-hidden />
                添加
              </Button>
            </div>
          </form>
        ) : null}
      </CatalogSection>
    </div>
  )
}
