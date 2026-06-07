import { cn } from '@repo/ui'

import { resolveMockMapRatio } from '../lib/map-controls-mock'

export function MapControlsRatioReadout({
  zoom,
  className,
  size = 'inline',
}: {
  zoom: number
  className?: string
  size?: 'inline' | 'footer'
}) {
  const { ratioLabel } = resolveMockMapRatio(zoom)

  return (
    <span
      key={ratioLabel}
      className={cn(
        'map-controls-ratio-value cc-mono tabular-nums text-foreground/80 dark:text-white/75',
        size === 'inline'
          ? 'text-[9px] leading-none font-medium tracking-tight'
          : 'map-foot-scale__value text-[11px] font-medium tracking-tight',
        className,
      )}
      title={ratioLabel}
    >
      {ratioLabel}
    </span>
  )
}
