export interface PanelOffset {
  x: number
  y: number
}

export interface ClampPanelOffsetInput {
  offset: PanelOffset
  containerWidth: number
  containerHeight: number
  panelWidth: number
  panelHeight: number
  /** 距容器左或右缘的默认锚点距离（px，与 tailwind left-3/right-3 一致为 12） */
  anchorInset: number
  anchorTop: number
  anchorSide: 'left' | 'right'
  margin?: number
}

/** 将面板平移限制在地图画布容器内 */
export function clampPanelOffset(input: ClampPanelOffsetInput): PanelOffset {
  const margin = input.margin ?? 8
  const maxY = Math.max(0, input.containerHeight - input.panelHeight - input.anchorTop - margin)
  const y = Math.min(Math.max(input.offset.y, -input.anchorTop + margin), maxY)

  const maxX = Math.max(0, input.containerWidth - input.panelWidth - input.anchorInset - margin)
  const minX = -input.anchorInset + margin

  // offset.x 正负与 translate 方向在 useMovablePanelDrag 中按 placement 处理，边界对称
  return {
    x: Math.min(Math.max(input.offset.x, minX), maxX),
    y,
  }
}
