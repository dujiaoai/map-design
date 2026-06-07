import {
  cn,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui'
import {
  LayersIcon,
  ListTreeIcon,
  MinusIcon,
  PlusIcon,
} from 'lucide-react'
import { useCallback, useState, type CSSProperties, type ReactNode } from 'react'

import { resolveNativeSidebarModule } from '~/features/map-workspace/lib/resolve-active-sidebar-module'
import { useMapWorkspaceStore } from '~/features/map-workspace'
import { WORKSPACE_CHROME_ICON_TONE_CLASS } from '~/shared/lib/workspace-chrome-styles'

import {
  resolveDefaultImageryPeriodId,
  type MapControlImageryPeriodId,
} from '../lib/map-control-imagery-periods'
import {
  countActiveMapControlLayers,
  createDefaultImageryPeriodId,
  createDefaultLayerVisibility,
  createImageryPeriodFromPreset,
  createLayerVisibilityFromPreset,
  MAP_CONTROL_LAYER_TOTAL,
  MAP_CONTROL_ZOOM,
  type MapControlToggleLayerId,
} from '../lib/map-controls-mock'
import { useMapControlLegendStore } from '../lib/map-control-legend-store'
import { useMockMapViewportStore } from '../lib/map-viewport-mock-store'
import { useMapControlsInset } from '../lib/use-map-controls-inset'
import { MapControlsCompass } from './map-controls-compass'
import { MapControlsFullExtentIcon } from './map-controls-full-extent-icon'
import { MapControlsLayersWing } from './map-controls-layers-panel'
import { MapControlsLegendWing } from './map-controls-legend-panel'
function dockBtnClass(active?: boolean, variant: 'data' | 'nav' = 'data') {
  return cn(
    variant === 'nav' ? 'map-controls-dock__nav-btn' : 'map-controls-dock__data-btn',
    WORKSPACE_CHROME_ICON_TONE_CLASS,
    active && 'map-controls-dock__btn--active',
  )
}

function DockIconButton({
  label,
  active,
  disabled,
  className,
  onClick,
  badge,
  tooltipSide = 'top',
  variant = 'data',
  children,
}: {
  label: string
  active?: boolean
  disabled?: boolean
  className?: string
  badge?: number
  tooltipSide?: 'top' | 'left'
  variant?: 'data' | 'nav'
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            disabled={disabled}
            className={cn(dockBtnClass(active, variant), className)}
            aria-label={label}
            aria-pressed={active}
            onClick={onClick}
          >
            {children}
            {badge != null && badge > 0 ? (
              <span className="map-controls-dock__badge cc-mono flex size-3.5 items-center justify-center rounded-full bg-brand text-[7px] font-semibold text-white">
                {badge}
              </span>
            ) : null}
          </button>
        }
      />
      <TooltipContent side={tooltipSide} className="text-[11px]">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function DockRailJoint({ label }: { label: string }) {
  return (
    <div className="map-controls-dock__joint" aria-hidden>
      <span className="map-controls-dock__joint-line" />
      <span className="map-controls-dock__joint-label cc-mono">{label}</span>
      <span className="map-controls-dock__joint-line" />
    </div>
  )
}

export function MapControls({ className }: { className?: string }) {
  const zoom = useMockMapViewportStore((state) => state.zoom)
  const bearing = useMockMapViewportStore((state) => state.bearing)
  const nudgeZoom = useMockMapViewportStore((state) => state.nudgeZoom)
  const resetView = useMockMapViewportStore((state) => state.resetView)
  const setBearing = useMockMapViewportStore((state) => state.setBearing)

  const legendItems = useMapControlLegendStore((state) => state.items)

  const [legendOpen, setLegendOpen] = useState(false)
  const [layersOpen, setLayersOpen] = useState(false)
  const [fullExtentFlash, setFullExtentFlash] = useState(false)
  const [layerVisibility, setLayerVisibility] = useState(createDefaultLayerVisibility)
  const [imageryPeriodId, setImageryPeriodId] = useState<MapControlImageryPeriodId | null>(
    createDefaultImageryPeriodId,
  )

  const inset = useMapControlsInset()
  const nativeModule = useMapWorkspaceStore((state) =>
    resolveNativeSidebarModule({
      activeDockModuleId: state.activeDockModuleId,
      dockPanelCollapsed: state.dockPanelCollapsed,
      activeModuleId: state.activeModuleId,
      modulePanelCollapsed: state.modulePanelCollapsed,
    }),
  )

  const activeLayerCount = countActiveMapControlLayers({
    layerVisibility,
    imageryPeriodId,
  })

  const toggleLayer = useCallback((layerId: MapControlToggleLayerId, next: boolean) => {
    setLayerVisibility((prev) => ({ ...prev, [layerId]: next }))
  }, [])

  const toggleHdImagery = useCallback((next: boolean) => {
    if (next) {
      setImageryPeriodId((current) => current ?? resolveDefaultImageryPeriodId())
      return
    }
    setImageryPeriodId(null)
  }, [])

  const selectImageryPeriod = useCallback((periodId: MapControlImageryPeriodId) => {
    setImageryPeriodId(periodId)
  }, [])

  const setAllLayers = useCallback((preset: 'all-on' | 'all-off') => {
    if (preset === 'all-off') {
      setLayerVisibility(createLayerVisibilityFromPreset('all-off'))
      setImageryPeriodId(null)
      return
    }

    setLayerVisibility(createLayerVisibilityFromPreset('all-on'))
    setImageryPeriodId(createImageryPeriodFromPreset('all-on'))
  }, [])

  const handleResetNorth = useCallback(() => {
    setBearing(0)
  }, [setBearing])

  const toggleLegend = useCallback(() => {
    setLegendOpen((open) => {
      if (!open) {
        setLayersOpen(false)
      }
      return !open
    })
  }, [])

  const closeLegend = useCallback(() => {
    setLegendOpen(false)
  }, [])

  const toggleLayers = useCallback(() => {
    setLayersOpen((open) => {
      if (!open) {
        setLegendOpen(false)
      }
      return !open
    })
  }, [])

  const closeLayers = useCallback(() => {
    setLayersOpen(false)
  }, [])

  const handleFullExtent = useCallback(() => {
    setFullExtentFlash(true)
    resetView()
    window.setTimeout(() => setFullExtentFlash(false), 480)
  }, [resetView])

  const insetStyle = {
    right: inset.right,
    bottom: inset.bottom,
  } as CSSProperties

  return (
    <TooltipProvider delay={350}>
      <div
        className={cn(
          'map-controls',
          nativeModule && 'map-controls--avoiding',
          className,
        )}
        style={insetStyle}
        aria-label="地图底图控件"
      >
        <MapControlsLegendWing open={legendOpen} items={legendItems} onClose={closeLegend} />

        <MapControlsLayersWing
          open={layersOpen}
          onClose={closeLayers}
          layerVisibility={layerVisibility}
          imageryPeriodId={imageryPeriodId}
          activeLayerCount={activeLayerCount}
          layerTotal={MAP_CONTROL_LAYER_TOTAL}
          onToggleLayer={toggleLayer}
          onToggleHdImagery={toggleHdImagery}
          onSelectImageryPeriod={selectImageryPeriod}
          onSetAllLayers={setAllLayers}
        />

        <div
          className={cn(
            'map-controls-dock cc-glass-panel',
            fullExtentFlash && 'map-controls-dock--flash',
          )}
        >
          <div className="map-controls-dock__data-deck">
            <DockIconButton
              label="图层"
              active={layersOpen}
              badge={activeLayerCount}
              tooltipSide="left"
              onClick={toggleLayers}
            >
              <LayersIcon className="size-3.5" strokeWidth={2} />
            </DockIconButton>

            <span className="map-controls-dock__data-seam" aria-hidden />

            <DockIconButton label="图例" active={legendOpen} tooltipSide="left" onClick={toggleLegend}>
              <ListTreeIcon className="size-3.5" strokeWidth={2} />
            </DockIconButton>
          </div>

          <DockRailJoint label="导航" />

          <div className="map-controls-dock__nav-rail">
            <div className="map-controls-dock__compass-slot">
              <MapControlsCompass
                bearing={bearing}
                onBearingChange={setBearing}
                onResetNorth={handleResetNorth}
                tooltipSide="left"
              />
            </div>

            <DockIconButton
              label="全图 · 恢复初始范围"
              active={fullExtentFlash}
              tooltipSide="left"
              variant="nav"
              onClick={handleFullExtent}
            >
              <MapControlsFullExtentIcon className="size-3.5" />
            </DockIconButton>
          </div>

          <DockRailJoint label="缩放" />

          <div className="map-controls-dock__zoom-block">
            <DockIconButton
              label="放大"
              disabled={zoom >= MAP_CONTROL_ZOOM.max}
              tooltipSide="left"
              variant="nav"
              onClick={() => nudgeZoom(1)}
            >
              <PlusIcon className="size-3.5" strokeWidth={2.25} />
            </DockIconButton>

            <DockIconButton
              label="缩小"
              disabled={zoom <= MAP_CONTROL_ZOOM.min}
              tooltipSide="left"
              variant="nav"
              onClick={() => nudgeZoom(-1)}
            >
              <MinusIcon className="size-3.5" strokeWidth={2.25} />
            </DockIconButton>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
