import { ThemeModeToggle, cn } from '@repo/ui'

import { useTheme } from '../model/theme-provider'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <ThemeModeToggle theme={theme} onToggle={toggleTheme} className={cn(className)} />
  )
}
