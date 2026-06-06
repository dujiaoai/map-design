export {
  clampSurfacePosition,
  createMovablePanelDragId,
  createSurfaceSnapModifier,
  EDGE_MARGIN,
  getSurfaceMetrics,
  NEEDS_LAYOUT_ANCHOR,
  NEEDS_LAYOUT_CENTER,
  PANEL_ANCHOR_INSET,
  PANEL_ANCHOR_TOP,
  QUICK_TOOLBAR_DRAG_ID,
  resolveDefaultAnchoredPosition,
  resolveDefaultCenter,
  snapSurfacePosition,
  SNAP_THRESHOLD,
  type SurfaceDragMetrics,
  type SurfaceDragPosition,
  type SurfaceSnapResult,
  type SurfaceSnapX,
  type SurfaceSnapY,
} from './lib/surface-drag-math'
export { loadPanelSurfacePosition, savePanelSurfacePosition } from './lib/surface-drag-storage'
export { useSurfaceDragPosition } from './lib/use-surface-drag-position'
export { useWorkspaceDndSensors, useWorkspaceSurfaceDnd } from './lib/use-workspace-surface-dnd'
export { WorkspaceSnapGuides } from './ui/workspace-snap-guides'
