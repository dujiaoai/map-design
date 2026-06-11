import { useEffect } from 'react'

import { applyDarkTheme, persistDarkTheme } from '~/shared/lib/theme'

/** 固定深色模式；保留 Provider 以兼容现有 AppProviders 结构 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyDarkTheme()
    persistDarkTheme()
  }, [])

  return children
}
