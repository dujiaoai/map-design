export const ADMIN_THEME_STORAGE_KEY = 'yunyan-admin-theme'

export type ThemeMode = 'light' | 'dark'

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null
  try {
    const value = localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

export function storeTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme)
  } catch {
    /* quota */
  }
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export const themeInitScript = `(function(){try{var k=${JSON.stringify(ADMIN_THEME_STORAGE_KEY)},t=localStorage.getItem(k);if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(e){document.documentElement.classList.add('dark')}})()`
