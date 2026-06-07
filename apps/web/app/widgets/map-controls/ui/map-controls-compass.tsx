import { cn, Tooltip, TooltipContent, TooltipTrigger } from '@repo/ui'
import { useCallback, useRef, useState } from 'react'

import {
  COMPASS_DRAG_THRESHOLD_PX,
  getPointerBearingAngle,
  isNorthBearing,
  normalizeBearing,
  resolveBearingFromDrag,
  resolveCompassAzimuthLabel,
  formatCompassBearingHint,
  snapCompassBearing,
} from '../lib/compass-bearing'

type CompassDragSession = {
  pointerId: number
  startAngle: number
  startBearing: number
  startX: number
  startY: number
  didDrag: boolean
}

export function MapControlsCompass({
  className,
  bearing = 0,
  onBearingChange,
  onResetNorth,
  tooltipSide = 'top',
}: {
  className?: string
  bearing?: number
  onBearingChange?: (bearing: number) => void
  onResetNorth?: () => void
  tooltipSide?: 'top' | 'left'
}) {
  const [pulse, setPulse] = useState(false)
  const [dragTooltipOpen, setDragTooltipOpen] = useState(false)
  const [blockHoverTooltip, setBlockHoverTooltip] = useState(false)
  const [previewBearing, setPreviewBearing] = useState<number | null>(null)
  const dragRef = useRef<CompassDragSession | null>(null)
  const pulseTimerRef = useRef<number | null>(null)

  const displayBearing = previewBearing ?? bearing
  const normalizedDisplay = normalizeBearing(displayBearing)
  const roundedBearing = Math.round(normalizedDisplay)
  const isRotating = dragTooltipOpen
  const isNorth = isNorthBearing(normalizedDisplay)
  const isEmphasized = !isNorth || isRotating
  const canRotate = Boolean(onBearingChange)
  const azimuthLabel = resolveCompassAzimuthLabel(normalizedDisplay)
  const bearingHint = formatCompassBearingHint(normalizedDisplay)

  const triggerPulse = useCallback(() => {
    setPulse(true)
    if (pulseTimerRef.current != null) {
      window.clearTimeout(pulseTimerRef.current)
    }
    pulseTimerRef.current = window.setTimeout(() => {
      setPulse(false)
      pulseTimerRef.current = null
    }, 420)
  }, [])

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (!canRotate || event.button !== 0) {
        return
      }

      event.currentTarget.setPointerCapture(event.pointerId)
      dragRef.current = {
        pointerId: event.pointerId,
        startAngle: getPointerBearingAngle(event.currentTarget, event.clientX, event.clientY),
        startBearing: bearing,
        startX: event.clientX,
        startY: event.clientY,
        didDrag: false,
      }
      setDragTooltipOpen(false)
      setBlockHoverTooltip(true)
      setPreviewBearing(bearing)
    },
    [bearing, canRotate],
  )

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const session = dragRef.current
      if (!session || session.pointerId !== event.pointerId || !onBearingChange) {
        return
      }

      const distance = Math.hypot(event.clientX - session.startX, event.clientY - session.startY)
      const currentAngle = getPointerBearingAngle(event.currentTarget, event.clientX, event.clientY)

      if (!session.didDrag && distance >= COMPASS_DRAG_THRESHOLD_PX) {
        session.didDrag = true
        session.startAngle = currentAngle
        session.startBearing = bearing
        setDragTooltipOpen(true)
      }

      if (!session.didDrag) {
        return
      }

      const nextBearing = resolveBearingFromDrag(
        session.startAngle,
        session.startBearing,
        currentAngle,
      )
      setPreviewBearing(nextBearing)
      onBearingChange(nextBearing)
    },
    [bearing, onBearingChange],
  )

  const finishPointer = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      const session = dragRef.current
      if (!session || session.pointerId !== event.pointerId) {
        return
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId)
      }

      if (session.didDrag && onBearingChange) {
        const finalBearing = snapCompassBearing(previewBearing ?? bearing)
        onBearingChange(finalBearing)
        setBlockHoverTooltip(true)
      } else if (!session.didDrag) {
        onResetNorth?.()
        if (!isNorthBearing(bearing)) {
          triggerPulse()
        }
        setBlockHoverTooltip(false)
      }

      dragRef.current = null
      setDragTooltipOpen(false)
      setPreviewBearing(null)
      event.currentTarget.blur()
    },
    [bearing, onBearingChange, onResetNorth, previewBearing, triggerPulse],
  )

  const handlePointerLeave = useCallback(() => {
    setBlockHoverTooltip(false)
  }, [])

  const tooltip = isRotating
    ? `旋转中 ${bearingHint}`
    : canRotate
      ? isNorth
        ? '指北向上 · 拖动旋转地图'
        : bearingHint
      : isNorth
        ? '指北向上'
        : bearingHint

  const tooltipOpen = isRotating ? true : blockHoverTooltip ? false : undefined

  return (
    <Tooltip open={tooltipOpen}>
      <TooltipTrigger
        render={
          <button
            type="button"
            className={cn(
              'map-controls-compass group relative flex size-7 shrink-0 items-center justify-center rounded-full touch-none select-none',
              canRotate && (isRotating ? 'cursor-grabbing' : 'cursor-grab'),
              'transition-[box-shadow,opacity,background-color,transform] duration-200',
              'focus-visible:ring-1 focus-visible:ring-brand/45 focus-visible:outline-none',
              isEmphasized
                ? 'map-controls-compass--rotated hover:bg-accent/70 dark:hover:bg-white/8'
                : 'map-controls-compass--idle hover:opacity-100',
              pulse && 'map-controls-compass--pulse',
              isRotating && 'map-controls-compass--dragging',
              className,
            )}
            aria-label={
              canRotate
                ? isNorth
                  ? '底图指北向上，拖动旋转，点击复位正北'
                  : `底图方向 ${bearingHint}，拖动旋转，点击复位正北`
                : isNorth
                  ? '底图指北向上，点击复位正北'
                  : `底图方向 ${bearingHint}，点击复位正北`
            }
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
            onPointerLeave={handlePointerLeave}
          >
            <svg
              className="map-controls-compass__bezel pointer-events-none absolute inset-0.5"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="9.25"
                className="fill-none stroke-foreground/12 dark:stroke-white/14"
                strokeWidth="0.75"
              />
              {[0, 90, 180, 270].map((angle) => (
                <line
                  key={angle}
                  x1="12"
                  y1="2.75"
                  x2="12"
                  y2={angle === 0 ? 5.1 : 4.35}
                  className={
                    angle === 0
                      ? 'stroke-foreground/35 dark:stroke-white/40'
                      : 'stroke-foreground/15 dark:stroke-white/18'
                  }
                  strokeWidth={angle === 0 ? 1 : 0.75}
                  strokeLinecap="round"
                  transform={`rotate(${angle} 12 12)`}
                />
              ))}
            </svg>

            <svg
              className="map-controls-compass-dial pointer-events-none absolute inset-0.5"
              viewBox="0 0 24 24"
              style={{ transform: `rotate(${-normalizedDisplay}deg)` }}
              aria-hidden
            >
              <path
                d="M12 4.2 L13.55 12.2 L12 10.4 L10.45 12.2 Z"
                className="fill-brand-light drop-shadow-[0_0_3px_color-mix(in_srgb,var(--brand)_55%,transparent)]"
              />
              <path
                d="M12 19.8 L10.45 11.8 L12 13.6 L13.55 11.8 Z"
                className="fill-foreground/28 dark:fill-white/28"
              />
              <circle cx="12" cy="12" r="1.1" className="fill-foreground/45 dark:fill-white/50" />
              {!isEmphasized ? (
                <text
                  x="12"
                  y="8.2"
                  textAnchor="middle"
                  className="fill-brand-light text-[4.5px] font-bold"
                  style={{ fontFamily: 'inherit' }}
                >
                  N
                </text>
              ) : null}
            </svg>

            {isEmphasized ? (
              <span
                className="map-controls-compass__readout pointer-events-none absolute inset-0 flex flex-col items-center justify-center leading-none text-brand-deep dark:text-brand-soft"
                aria-hidden
              >
                <span className="cc-mono text-[8px] font-semibold tabular-nums">{roundedBearing}°</span>
                <span className="mt-px max-w-[92%] truncate text-[6.5px] font-medium">{azimuthLabel}</span>
              </span>
            ) : null}

            {isRotating ? (
              <span
                className="map-controls-compass__orbit pointer-events-none absolute inset-0 rounded-full"
                aria-hidden
              />
            ) : null}
          </button>
        }
      />
      <TooltipContent side={tooltipSide} className="text-[11px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
}
