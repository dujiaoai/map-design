import { cn } from '@repo/ui'

import { EDGE_MARGIN, type SurfaceSnapX, type SurfaceSnapY } from '../lib/surface-drag-math'

export function WorkspaceSnapGuides({
  containerWidth,
  activeSnapX,
  activeSnapY,
}: {
  containerWidth: number
  activeSnapX: SurfaceSnapX | null
  activeSnapY: SurfaceSnapY | null
}) {
  return (
    <div
      className="workspace-surface-snap-guides pointer-events-none absolute inset-0 z-10"
      aria-hidden
    >
      <div
        className={cn(
          'workspace-surface-snap-guide workspace-surface-snap-guide--vertical',
          activeSnapX === 'left' && 'workspace-surface-snap-guide--active',
        )}
        style={{ left: EDGE_MARGIN }}
      />
      <div
        className={cn(
          'workspace-surface-snap-guide workspace-surface-snap-guide--vertical',
          activeSnapX === 'center' && 'workspace-surface-snap-guide--active',
        )}
        style={{ left: containerWidth / 2 }}
      />
      <div
        className={cn(
          'workspace-surface-snap-guide workspace-surface-snap-guide--vertical',
          activeSnapX === 'right' && 'workspace-surface-snap-guide--active',
        )}
        style={{ right: EDGE_MARGIN }}
      />
      <div
        className={cn(
          'workspace-surface-snap-guide workspace-surface-snap-guide--horizontal',
          activeSnapY === 'top' && 'workspace-surface-snap-guide--active',
        )}
        style={{ top: EDGE_MARGIN }}
      />
    </div>
  )
}
