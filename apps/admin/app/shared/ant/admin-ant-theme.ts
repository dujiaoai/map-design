import { theme, type ThemeConfig } from 'antd'

/** 浅色：工业运维台 — 雾蓝灰分层，避免 #fff 刺眼 */
export const ADMIN_LIGHT_SURFACES = {
  canvas: '#e6ecf2',
  panel: '#eef2f6',
  elevated: '#f3f6f9',
  border: '#c5d0dc',
  muted: '#dfe6ee',
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
    colorPrimary: '#30758c',
    colorInfo: '#30758c',
    colorBgBase: ADMIN_LIGHT_SURFACES.canvas,
    colorBgContainer: ADMIN_LIGHT_SURFACES.panel,
    colorBgElevated: ADMIN_LIGHT_SURFACES.elevated,
    colorBgLayout: ADMIN_LIGHT_SURFACES.canvas,
    colorBorder: ADMIN_LIGHT_SURFACES.border,
    colorBorderSecondary: '#d4dde6',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorTextHeading: '#0c1222',
    colorFillAlter: ADMIN_LIGHT_SURFACES.muted,
    colorFillSecondary: ADMIN_LIGHT_SURFACES.muted,
    borderRadius: 10,
    fontFamily: "'Noto Sans SC', system-ui, sans-serif",
    fontSize: 14,
    controlHeight: 36,
  },
  components: {
    Table: {
      headerBg: ADMIN_LIGHT_SURFACES.muted,
      headerColor: '#64748b',
      rowHoverBg: 'rgba(48, 117, 140, 0.06)',
      borderColor: ADMIN_LIGHT_SURFACES.border,
      cellPaddingBlock: 12,
      cellPaddingInline: 16,
    },
    DatePicker: {
      cellHoverBg: 'rgba(70, 174, 184, 0.14)',
      cellActiveWithRangeBg: 'rgba(70, 174, 184, 0.12)',
    },
    Tree: {
      nodeHoverBg: 'rgba(48, 117, 140, 0.06)',
      directoryNodeSelectedBg: 'rgba(70, 174, 184, 0.14)',
    },
    Modal: {
      contentBg: ADMIN_LIGHT_SURFACES.elevated,
      headerBg: ADMIN_LIGHT_SURFACES.elevated,
      titleColor: '#0c1222',
      footerBg: ADMIN_LIGHT_SURFACES.elevated,
    },
  },
}

export function getAdminAntTheme(mode: 'light' | 'dark'): ThemeConfig {
  return mode === 'dark' ? adminAntDarkTheme : adminAntLightTheme
}

/** @deprecated 使用 getAdminAntTheme */
export const adminAntTheme = adminAntDarkTheme
