import {
  cn,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui'
import { XIcon } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentProps, type CSSProperties } from 'react'

import { WORKSPACE_CHROME_ICON_TONE_CLASS } from '~/shared/lib/workspace-chrome-styles'

import {
  MOCK_IMAGERY_PERIODS,
  type MapControlImageryPeriodId,
} from '../lib/map-control-imagery-periods'
import {
  MAP_CONTROL_LAYER_GROUPS,
  MAP_CONTROL_LAYERS,
  type MapControlLayerId,
  type MapControlToggleLayerId,
} from '../lib/map-controls-mock'

function LayerBulkAction({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground rounded px-1.5 py-0.5 text-[10px] transition-colors hover:bg-accent dark:text-white/45 dark:hover:bg-white/8 dark:hover:text-white/80"
      onClick={onClick}
    >
      {label}
    </button>
  )
}

function LayerToggleRow({
  label,
  checked,
  onCheckedChange,
  trailing,
  className,
}: {
  label: string
  checked: boolean
  onCheckedChange: (next: boolean) => void
  trailing?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'map-controls-layer-row flex items-center gap-1 rounded-md px-0.5 transition-colors',
        checked && 'bg-brand/8 dark:bg-brand/12',
        className,
      )}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-xs transition-colors',
          checked
            ? 'text-foreground dark:text-white/90'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground dark:text-white/55 dark:hover:bg-white/6',
        )}
        onClick={() => onCheckedChange(!checked)}
      >
        <span
          className={cn(
            'relative size-3.5 shrink-0 rounded-[3px] border',
            checked
              ? 'border-brand bg-brand text-background'
              : 'border-border bg-background/60 dark:border-white/20 dark:bg-white/5',
          )}
          aria-hidden
        >
          {checked ? (
            <svg viewBox="0 0 12 12" className="absolute inset-0 m-auto size-2.5">
              <path
                d="M2.5 6.2 4.8 8.5 9.5 3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </button>
      {trailing}
    </div>
  )
}

function ImageryPeriodSelect({
  periodId,
  disabled,
  onSelectPeriod,
}: {
  periodId: MapControlImageryPeriodId | null
  disabled?: boolean
  onSelectPeriod: (periodId: MapControlImageryPeriodId) => void
}) {
  return (
    <Select
      value={periodId ?? undefined}
      disabled={disabled}
      onValueChange={(value) => {
        if (value) {
          onSelectPeriod(value as MapControlImageryPeriodId)
        }
      }}
    >
      <SelectTrigger
        size="sm"
        className="map-controls-period-select h-6 min-w-[5.25rem] max-w-[6.5rem] shrink-0 border-border/70 bg-background/80 px-1.5 text-[10px] shadow-none dark:border-white/15 dark:bg-white/6"
        aria-label="高清影像期数"
        onClick={(event) => event.stopPropagation()}
      >
        <SelectValue placeholder="期数" />
      </SelectTrigger>
      <SelectContent
        side="top"
        align="end"
        sideOffset={4}
        className="map-controls-period-select__content z-[60] min-w-[9.5rem]"
      >
        {MOCK_IMAGERY_PERIODS.map((period) => (
          <SelectItem key={period.id} value={period.id} className="text-xs">
            {period.label}
            {period.isLatest ? ' · 最新' : ''}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function MapControlsLayersPanel({
  layerVisibility,
  imageryPeriodId,
  activeLayerCount,
  layerTotal,
  onToggleLayer,
  onToggleHdImagery,
  onSelectImageryPeriod,
}: {
  layerVisibility: Record<MapControlToggleLayerId, boolean>
  imageryPeriodId: MapControlImageryPeriodId | null
  activeLayerCount: number
  layerTotal: number
  onToggleLayer: (layerId: MapControlToggleLayerId, next: boolean) => void
  onToggleHdImagery: (next: boolean) => void
  onSelectImageryPeriod: (periodId: MapControlImageryPeriodId) => void
}) {
  const hdImageryOn = imageryPeriodId != null

  const layersByGroup = useMemo(() => {
    return MAP_CONTROL_LAYER_GROUPS.map((group) => ({
      ...group,
      layers: MAP_CONTROL_LAYERS.filter(
        (layer) => layer.kind === group.id && !layer.periodDriven,
      ),
    }))
  }, [])

  return (
    <div className="map-controls-layers-panel flex flex-col gap-2">
      {layersByGroup.map((group) => (
        <section key={group.id} className="map-controls-layers-group">
          <p className="map-controls-layers-group__label cc-mono text-muted-foreground mb-1 px-0.5 text-[9px] tracking-wide uppercase dark:text-white/35">
            {group.label}
          </p>

          <div className="flex flex-col gap-0.5">
            {group.id === 'basemap' ? (
              <LayerToggleRow
                label="高清影像"
                checked={hdImageryOn}
                onCheckedChange={onToggleHdImagery}
                trailing={
                  <ImageryPeriodSelect
                    periodId={imageryPeriodId}
                    disabled={!hdImageryOn}
                    onSelectPeriod={onSelectImageryPeriod}
                  />
                }
              />
            ) : null}

            {group.layers.map((layer) => (
              <LayerToggleRow
                key={layer.id}
                label={layer.label}
                checked={layerVisibility[layer.id as MapControlToggleLayerId]}
                onCheckedChange={(next) =>
                  onToggleLayer(layer.id as MapControlToggleLayerId, next)
                }
              />
            ))}
          </div>
        </section>
      ))}

      <p className="text-muted-foreground cc-mono px-0.5 text-[9px] tabular-nums dark:text-white/30">
        共 {activeLayerCount}/{layerTotal} 层可见
      </p>
    </div>
  )
}

export type { MapControlLayerId, MapControlToggleLayerId }

type MapControlsLayersPanelProps = Omit<
  ComponentProps<typeof MapControlsLayersPanel>,
  'onSetAllLayers'
>

const LAYERS_WING_GAP_PX = 6
const LAYERS_WING_MIN_HEIGHT_PX = 10.5 * 16

function measureLayersWingMaxHeight(controlsEl: HTMLElement) {
  const canvas = controlsEl.closest('.workspace-canvas')
  if (!canvas) {
    return LAYERS_WING_MIN_HEIGHT_PX
  }

  const canvasRect = canvas.getBoundingClientRect()
  const controlsRect = controlsEl.getBoundingClientRect()
  const available = controlsRect.bottom - canvasRect.top - LAYERS_WING_GAP_PX

  return Math.max(LAYERS_WING_MIN_HEIGHT_PX, Math.floor(available))
}

/** 图层翼：固定头 + 内容一次性全部展示 */
export function MapControlsLayersWing({
  open,
  onClose,
  activeLayerCount,
  layerTotal,
  onSetAllLayers,
  ...panelProps
}: MapControlsLayersPanelProps & {
  open: boolean
  onClose: () => void
  onSetAllLayers: (preset: 'all-on' | 'all-off') => void
}) {
  const wingRef = useRef<HTMLDivElement>(null)
  const [wingStyle, setWingStyle] = useState<CSSProperties>()

  const syncWingLayout = useCallback(() => {
    const controls = wingRef.current?.closest('.map-controls')
    if (!controls || !(controls instanceof HTMLElement)) {
      return
    }

    setWingStyle({ maxHeight: measureLayersWingMaxHeight(controls) })
  }, [])

  useLayoutEffect(() => {
    if (!open) {
      return
    }

    syncWingLayout()

    const canvas = document.querySelector('.workspace-canvas')
    const controls = wingRef.current?.closest('.map-controls')
    const observer = new ResizeObserver(syncWingLayout)

    if (canvas) observer.observe(canvas)
    if (controls) observer.observe(controls)

    window.addEventListener('resize', syncWingLayout)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncWingLayout)
    }
  }, [open, syncWingLayout])
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    if (!open) {
      return
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, handleEscape])

  if (!open) {
    return null
  }

  return (
    <div
      ref={wingRef}
      className="map-controls-layers-wing cc-glass-panel"
      style={wingStyle}
      role="dialog"
      aria-modal="false"
      aria-label="地图图层"
    >
      <header className="map-controls-layers-wing__header flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium">图层</p>
          <p className="text-muted-foreground text-[10px] dark:text-white/45">
            已开 {activeLayerCount}/{layerTotal}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <LayerBulkAction label="全开" onClick={() => onSetAllLayers('all-on')} />
          <span className="text-muted-foreground text-[10px] dark:text-white/25">|</span>
          <LayerBulkAction label="全关" onClick={() => onSetAllLayers('all-off')} />
          <button
            type="button"
            className={cn(
              'ml-0.5 flex size-5 shrink-0 items-center justify-center rounded-[4px] transition-colors',
              WORKSPACE_CHROME_ICON_TONE_CLASS,
            )}
            aria-label="关闭图层"
            onClick={onClose}
          >
            <XIcon className="size-3" strokeWidth={2.25} />
          </button>
        </div>
      </header>

      <div className="map-controls-layers-wing__body">
        <MapControlsLayersPanel
          activeLayerCount={activeLayerCount}
          layerTotal={layerTotal}
          {...panelProps}
        />
      </div>
    </div>
  )
}
