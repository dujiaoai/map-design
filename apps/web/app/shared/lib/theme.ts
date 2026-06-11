export const THEME_STORAGE_KEY = 'yunyan-theme'

/** 产品仅支持深色模式 */
export type ThemeMode = 'dark'

export function applyDarkTheme() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add('dark')
}

export function persistDarkTheme() {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark')
  } catch {
    // ignore
  }
}

/** root.tsx 内联：首屏即 dark，避免闪烁 */
export const themeInitScript = `(function(){try{document.documentElement.classList.add('dark');localStorage.setItem(${JSON.stringify(THEME_STORAGE_KEY)},'dark')}catch(e){document.documentElement.classList.add('dark')}})()`
