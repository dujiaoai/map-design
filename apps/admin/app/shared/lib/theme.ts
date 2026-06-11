export const ADMIN_THEME_STORAGE_KEY = 'yunyan-admin-theme'

export type ThemeMode = 'dark'

export function applyDarkTheme() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.add('dark')
}

export function persistDarkTheme() {
  try {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, 'dark')
  } catch {
    // ignore
  }
}

export const themeInitScript = `(function(){try{document.documentElement.classList.add('dark');localStorage.setItem(${JSON.stringify(ADMIN_THEME_STORAGE_KEY)},'dark')}catch(e){document.documentElement.classList.add('dark')}})()`
