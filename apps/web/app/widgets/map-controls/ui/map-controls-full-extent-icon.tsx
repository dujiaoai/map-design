import { cn } from '@repo/ui'

/** GIS 惯例「全图 / 恢复视图范围」：四角框选 + 内层范围 */
export function MapControlsFullExtentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn('shrink-0', className)}
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="5" width="6" height="6" rx="0.5" className="opacity-40" />
      <path d="M2.75 5.25V2.75H5.25" />
      <path d="M10.75 2.75H13.25V5.25" />
      <path d="M13.25 10.75V13.25H10.75" />
      <path d="M5.25 13.25H2.75V10.75" />
    </svg>
  )
}
