export const ADMIN_THEME_STORAGE_KEY = 'yunyan-admin-theme'

export type ThemeMode = 'light' | 'dark'

export const DEFAULT_THEME: ThemeMode = 'dark'

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function applyTheme(theme: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME
  try {
    const stored = localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    return isThemeMode(stored) ? stored : DEFAULT_THEME
  } catch {
    return DEFAULT_THEME
  }
}

export function getThemeFromDocument(): ThemeMode {
  if (typeof document === 'undefined') return DEFAULT_THEME
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function persistTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

export const themeInitScript = `(function(){try{var k=${JSON.stringify(ADMIN_THEME_STORAGE_KEY)};var s=localStorage.getItem(k);var t=s==='light'||s==='dark'?s:'dark';document.documentElement.classList.toggle('dark',t==='dark')}catch(e){document.documentElement.classList.add('dark')}})()`
