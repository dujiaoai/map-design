import { Button, cn } from '@repo/ui'
import { MoonIcon, SunIcon } from 'lucide-react'

import { WORKSPACE_CHROME_ICON_BUTTON_CLASS } from '~/shared/lib/workspace-chrome-styles'

import { useTheme } from '../model/theme-provider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn(WORKSPACE_CHROME_ICON_BUTTON_CLASS, className)}
      aria-label={isDark ? '切换为浅色模式' : '切换为深色模式'}
      title={isDark ? '浅色模式' : '深色模式'}
      onClick={toggleTheme}
    >
      {isDark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
    </Button>
  )
}
