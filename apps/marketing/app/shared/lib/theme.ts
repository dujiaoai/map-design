export const MARKETING_THEME_STORAGE_KEY = 'yunyan-marketing-theme'

export type ThemeMode = 'dark'

export const DEFAULT_THEME: ThemeMode = 'dark'

export const themeInitScript = `(function(){try{document.documentElement.classList.add('dark')}catch(e){document.documentElement.classList.add('dark')}})()`
