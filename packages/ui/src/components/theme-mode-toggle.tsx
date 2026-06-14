import { MoonIcon, SunIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from './ui/button'

export type ThemeMode = 'light' | 'dark'

export function ThemeModeToggle({
  theme,
  onToggle,
  className,
}: {
  theme: ThemeMode
  onToggle: () => void
  className?: string
}) {
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn('text-muted-foreground hover:text-foreground', className)}
      aria-label={isDark ? '切换到浅色模式' : '切换到深色模式'}
      onClick={onToggle}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}
