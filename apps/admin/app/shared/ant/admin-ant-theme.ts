import { theme, type ThemeConfig } from 'antd'

/** 浅色：晨雾测绘台 — 与 app.css admin-light-* token 对齐 */
export const ADMIN_LIGHT_SURFACES = {
  canvas: '#e2e9ef',
  panel: '#f4f8fa',
  elevated: '#ffffff',
  surface: '#ebf0f5',
  border: '#ccd7e2',
  borderStrong: '#b4c4d2',
  muted: '#ebf0f5',
  tealWash: '#d6ebee',
} as const

/** Admin 深色；token 对齐 packages/ui globals.css .dark */
export const adminAntDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#46aeb8',
    colorInfo: '#46aeb8',
    colorBgBase: '#0b1528',
    colorBgContainer: '#0b1528',
    colorBgElevated: '#0f1c34',
    colorBorder: 'rgba(255, 255, 255, 0.08)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',
    colorText: '#e8f1ff',
    colorTextSecondary: 'rgba(232, 241, 255, 0.55)',
    borderRadius: 10,
    fontFamily: "'Noto Sans SC', system-ui, sans-serif",
    fontSize: 14,
    controlHeight: 36,
  },
  components: {
    Table: {
      headerBg: 'rgba(255, 255, 255, 0.04)',
      headerColor: 'rgba(232, 241, 255, 0.55)',
      rowHoverBg: 'rgba(70, 174, 184, 0.08)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    DatePicker: {
      cellHoverBg: 'rgba(70, 174, 184, 0.12)',
    },
    Tree: {
      nodeHoverBg: 'rgba(70, 174, 184, 0.08)',
      directoryNodeSelectedBg: 'rgba(70, 174, 184, 0.16)',
    },
    Modal: {
      contentBg: '#0f1c34',
      headerBg: '#0f1c34',
      titleColor: '#e8f1ff',
    },
  },
}

export const adminAntLightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#2a6d7f',
    colorInfo: '#2a6d7f',
    colorLink: '#2a6d7f',
    colorBgBase: ADMIN_LIGHT_SURFACES.canvas,
    colorBgContainer: ADMIN_LIGHT_SURFACES.panel,
    colorBgElevated: ADMIN_LIGHT_SURFACES.elevated,
    colorBgLayout: ADMIN_LIGHT_SURFACES.canvas,
    colorBorder: ADMIN_LIGHT_SURFACES.borderStrong,
    colorBorderSecondary: ADMIN_LIGHT_SURFACES.border,
    colorText: '#091320',
    colorTextSecondary: '#4a5d70',
    colorTextHeading: '#091320',
    colorFillAlter: ADMIN_LIGHT_SURFACES.muted,
    colorFillSecondary: ADMIN_LIGHT_SURFACES.tealWash,
    borderRadius: 10,
    fontFamily: "'Noto Sans SC', system-ui, sans-serif",
    fontSize: 14,
    controlHeight: 36,
    boxShadow:
      '0 1px 2px rgba(9, 19, 32, 0.05), 0 10px 28px rgba(42, 109, 127, 0.07)',
    boxShadowSecondary:
      '0 1px 2px rgba(9, 19, 32, 0.04), 0 6px 16px rgba(42, 109, 127, 0.06)',
  },
  components: {
    Table: {
      headerBg: ADMIN_LIGHT_SURFACES.surface,
      headerColor: '#4a5d70',
      rowHoverBg: 'rgba(42, 109, 127, 0.05)',
      borderColor: ADMIN_LIGHT_SURFACES.border,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    DatePicker: {
      cellHoverBg: 'rgba(70, 174, 184, 0.12)',
      cellActiveWithRangeBg: 'rgba(70, 174, 184, 0.1)',
    },
    Tree: {
      nodeHoverBg: 'rgba(42, 109, 127, 0.05)',
      directoryNodeSelectedBg: 'rgba(70, 174, 184, 0.14)',
    },
    Modal: {
      contentBg: ADMIN_LIGHT_SURFACES.elevated,
      headerBg: ADMIN_LIGHT_SURFACES.elevated,
      titleColor: '#091320',
      footerBg: ADMIN_LIGHT_SURFACES.panel,
    },
    Input: {
      activeBorderColor: '#2a6d7f',
      hoverBorderColor: '#b4c4d2',
    },
    Select: {
      optionSelectedBg: ADMIN_LIGHT_SURFACES.tealWash,
    },
  },
}

export function getAdminAntTheme(mode: 'light' | 'dark'): ThemeConfig {
  return mode === 'dark' ? adminAntDarkTheme : adminAntLightTheme
}

/** @deprecated 使用 getAdminAntTheme */
export const adminAntTheme = adminAntDarkTheme
