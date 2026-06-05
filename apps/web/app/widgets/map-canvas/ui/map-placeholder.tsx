import { CommandRadar } from '~/widgets/workspace-shell'

export function MapPlaceholder() {
  return (
    <div className="workspace-map-stage absolute inset-0">
      <div className="workspace-map-hud">
        <CommandRadar size="lg" />
        <div className="space-y-1">
          <p className="cc-display workspace-map-title">
            <span className="cc-headline-gradient">地图引擎待接入</span>
          </p>
          <p className="workspace-map-subtitle">Awaiting Map SDK · EPSG:4326</p>
        </div>
        <div className="cc-coord-readout cc-mono mt-2 rounded-lg px-3 py-2 text-[10px] leading-relaxed text-white/55">
          <p className="text-brand-light/80 mb-0.5 text-[9px] tracking-widest uppercase">Viewport</p>
          <p>点击左上快捷工具 · 顶栏搜索 · 侧栏打开数据与业务模块</p>
        </div>
      </div>
    </div>
  )
}
