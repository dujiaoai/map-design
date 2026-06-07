export type MapControlLegendSymbol = 'fill' | 'line' | 'point' | 'dashed'

export type MapControlLegendItem = {
  id: string
  label: string
  symbol: MapControlLegendSymbol
  swatchClass: string
}

/** Mock 动态图例（接入地图引擎后由图层/专题驱动 setLegendItems 替换） */
export const MOCK_MAP_CONTROL_LEGEND_ITEMS: MapControlLegendItem[] = [
  { id: 'ortho', label: '正射影像', symbol: 'fill', swatchClass: 'bg-brand/85' },
  { id: 'vector', label: '矢量要素', symbol: 'line', swatchClass: 'bg-amber-500' },
  { id: 'boundary', label: '行政边界', symbol: 'dashed', swatchClass: 'border-violet-400' },
  { id: 'poi', label: '兴趣点位', symbol: 'point', swatchClass: 'bg-emerald-500' },
  { id: 'road', label: '城市道路中心线专题图层', symbol: 'line', swatchClass: 'bg-orange-400' },
  { id: 'water', label: '水系面', symbol: 'fill', swatchClass: 'bg-sky-500/80' },
  { id: 'building', label: '建筑物', symbol: 'fill', swatchClass: 'bg-slate-400/90' },
  { id: 'plot', label: '地块范围', symbol: 'dashed', swatchClass: 'border-rose-400' },
  { id: 'monitor', label: '重点路段视频监控点位分布', symbol: 'point', swatchClass: 'bg-cyan-400' },
  { id: 'event', label: '事件热力', symbol: 'fill', swatchClass: 'bg-red-500/75' },
  { id: 'panorama', label: '全景点', symbol: 'point', swatchClass: 'bg-yellow-400' },
  { id: 'uav', label: '无人机轨迹', symbol: 'line', swatchClass: 'bg-lime-400' },
  { id: 'fence', label: '电子围栏', symbol: 'dashed', swatchClass: 'border-amber-300' },
]

/** @deprecated 使用 MOCK_MAP_CONTROL_LEGEND_ITEMS 或 useMapControlLegendStore */
export const MAP_CONTROL_LEGEND_ITEMS = MOCK_MAP_CONTROL_LEGEND_ITEMS
