import { useEffect } from 'react'

import { applyDarkTheme, persistDarkTheme } from '~/shared/lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyDarkTheme()
    persistDarkTheme()
  }, [])

  return children
}
