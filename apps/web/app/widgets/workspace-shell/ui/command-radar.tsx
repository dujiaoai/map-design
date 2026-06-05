import { cn } from '@repo/ui'

export function CommandRadar({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const sizeClass =
    size === 'sm' ? 'w-8' : size === 'lg' ? 'w-[clamp(7rem,16vh,10rem)]' : 'w-[clamp(5rem,12vh,7.5rem)]'

  return (
    <div className={cn('cc-radar', sizeClass, className)} aria-hidden="true">
      <div className="cc-radar-ring" />
      <div className="cc-radar-ring" />
      <div className="cc-radar-ring" />
      <div className="cc-radar-ring" />
      <div className="cc-radar-sweep" />
      <div className="cc-radar-core" />
      {size !== 'sm' ? (
        <>
          <div className="cc-radar-blip cc-radar-blip-a" />
          <div className="cc-radar-blip cc-radar-blip-b" />
          <div className="cc-radar-blip cc-radar-blip-c" />
        </>
      ) : null}
    </div>
  )
}
