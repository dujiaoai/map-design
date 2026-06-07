import {
  resolveDefaultImageryPeriodId,
  type MapControlImageryPeriodId,
} from './map-control-imagery-periods'

export type MapControlLayerId =
  | 'panorama-roam'
  | 'hd-imagery'
  | 'electronic-basemap'
  | 'admin-divisions'
  | 'road-labels'

export type MapControlLayerKind = 'basemap' | 'overlay'

export type MapControlLayerDef = {
  id: MapControlLayerId
  label: string
  defaultOn: boolean
  kind: MapControlLayerKind
  /** 高清影像由期数驱动显隐，不参与 boolean 开关表 */
  periodDriven?: boolean
}

export const MAP_CONTROL_LAYERS: MapControlLayerDef[] = [
  {
    id: 'hd-imagery',
    label: '高清影像',
    defaultOn: true,
    kind: 'basemap',
    periodDriven: true,
  },
  { id: 'electronic-basemap', label: '电子底图', defaultOn: true, kind: 'basemap' },
  { id: 'panorama-roam', label: '全景漫游', defaultOn: false, kind: 'basemap' },
  { id: 'admin-divisions', label: '行政区划', defaultOn: false, kind: 'overlay' },
  { id: 'road-labels', label: '地名路网', defaultOn: true, kind: 'overlay' },
]

export const MAP_CONTROL_LAYER_GROUPS = [
  { id: 'basemap' as const, label: '底图' },
  { id: 'overlay' as const, label: '叠加' },
]

const TOGGLE_LAYER_IDS = MAP_CONTROL_LAYERS.filter((layer) => !layer.periodDriven).map(
  (layer) => layer.id,
)

export type MapControlToggleLayerId = (typeof TOGGLE_LAYER_IDS)[number]

export const MAP_CONTROL_ZOOM = {
  min: 3,
  max: 20,
  default: 14,
} as const

const BASE_ZOOM = MAP_CONTROL_ZOOM.default
/** mock 基准比例尺分母（zoom 14 ≈ 1:133333） */
const BASE_RATIO_DENOMINATOR = 133_333

export function resolveMockMapRatio(zoom: number) {
  const factor = 2 ** (zoom - BASE_ZOOM)
  const ratioDenominator = Math.round(BASE_RATIO_DENOMINATOR * factor)
  return {
    ratioDenominator,
    ratioLabel: `1:${ratioDenominator}`,
  }
}

/** @deprecated 使用 resolveMockMapRatio；保留 barWidthPx 供后续接入地面距离刻度 */
export function resolveMockScaleBar(zoom: number) {
  return resolveMockMapRatio(zoom)
}

export type MapControlLegendSymbol = 'fill' | 'line' | 'point' | 'dashed'

export type { MapControlLegendItem } from './map-control-legend'
export {
  MAP_CONTROL_LEGEND_ITEMS,
  MOCK_MAP_CONTROL_LEGEND_ITEMS,
} from './map-control-legend'

export function createDefaultLayerVisibility(): Record<MapControlToggleLayerId, boolean> {
  return createLayerVisibilityFromPreset('default')
}

export function createDefaultImageryPeriodId(): MapControlImageryPeriodId | null {
  const hdLayer = MAP_CONTROL_LAYERS.find((layer) => layer.id === 'hd-imagery')
  if (!hdLayer?.defaultOn) {
    return null
  }
  return resolveDefaultImageryPeriodId()
}

export function createImageryPeriodFromPreset(
  preset: 'default' | 'all-on' | 'all-off',
): MapControlImageryPeriodId | null {
  if (preset === 'all-off') {
    return null
  }
  if (preset === 'all-on') {
    return resolveDefaultImageryPeriodId()
  }
  return createDefaultImageryPeriodId()
}

export function createLayerVisibilityFromPreset(
  preset: 'default' | 'all-on' | 'all-off',
): Record<MapControlToggleLayerId, boolean> {
  if (preset === 'all-on') {
    return Object.fromEntries(TOGGLE_LAYER_IDS.map((id) => [id, true])) as Record<
      MapControlToggleLayerId,
      boolean
    >
  }
  if (preset === 'all-off') {
    return Object.fromEntries(TOGGLE_LAYER_IDS.map((id) => [id, false])) as Record<
      MapControlToggleLayerId,
      boolean
    >
  }
  return Object.fromEntries(
    TOGGLE_LAYER_IDS.map((id) => {
      const layer = MAP_CONTROL_LAYERS.find((entry) => entry.id === id)
      return [id, layer?.defaultOn ?? false]
    }),
  ) as Record<MapControlToggleLayerId, boolean>
}

export function countActiveMapControlLayers(input: {
  layerVisibility: Record<MapControlToggleLayerId, boolean>
  imageryPeriodId: MapControlImageryPeriodId | null
}) {
  const toggleCount = TOGGLE_LAYER_IDS.filter((id) => input.layerVisibility[id]).length
  const imageryCount = input.imageryPeriodId ? 1 : 0
  return toggleCount + imageryCount
}

export const MAP_CONTROL_LAYER_TOTAL = TOGGLE_LAYER_IDS.length + 1
